import { expect, nock, sinon } from '../../test-helper.js';
import taskAppMetrics from '../../../lib/application/task-app-metrics.js';
import config from '../../../config.js';

describe('#taskAppMetrics', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskAppMetrics();
    } catch (_) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });

  it('should report container metrics of the applications monitored for their database and of the additional ones', async function () {
    // given

    const consoleLog = sinon.stub(console, 'log');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });

    for (const application of [...config.SCALINGO_APPS, ...config.SCALINGO_ADDITIONAL_APPS]) {
      nock('https://api.REGION.scalingo.com/v1')
        .get(`/apps/${application}/stats`)
        .reply(200, { stats: [{ id: 'web-1', memory_usage: 200105984 }] });
    }

    // when
    await taskAppMetrics();

    // then
    expect(nock.isDone()).to.be.true;
    const monitoredApps = consoleLog.getCalls().map((call) => JSON.parse(call.args[0]).app);
    expect(monitoredApps).to.deep.equal(['application-1', 'application-2', 'application-3']);
  });

  it('should report the cpu and the memory of each container', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    sinon.stub(config, 'SCALINGO_APPS').value(['application-1']);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value([]);
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1')
      .get(`/apps/application-1/stats`)
      .reply(200, {
        stats: [
          {
            id: 'web-1',
            cpu_usage: 42,
            memory_usage: 200105984,
            memory_limit: 536870912,
            highest_memory_usage: 203440128,
            swap_usage: 212992,
            swap_limit: 1610612736,
            highest_swap_usage: 0,
          },
        ],
      });

    // when
    await taskAppMetrics();

    // then
    expect(nock.isDone()).to.be.true;
    expect(JSON.parse(consoleLog.firstCall.args[0]).data).to.deep.equal({
      container: 'web-1',
      memory: {
        memory: 200105984,
        memory_max: 203440128,
        memory_limit: 536870912,
        swap: 212992,
        swap_max: 0,
        swap_limit: 1610612736,
        memory_total: 200318976,
      },
      cpu: { cpu: 42 },
    });
  });

  it('should report container metrics of every application of the account when SCALINGO_ADDITIONAL_APPS is a wildcard', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    sinon.stub(config, 'SCALINGO_APPS').value(['application-1']);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value('*');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1')
      .get('/apps')
      .reply(200, { apps: [{ name: 'application-1' }, { name: 'application-4' }] });

    for (const application of ['application-1', 'application-4']) {
      nock('https://api.REGION.scalingo.com/v1')
        .get(`/apps/${application}/stats`)
        .reply(200, { stats: [{ id: 'web-1', memory_usage: 200105984 }] });
    }

    // when
    await taskAppMetrics();

    // then
    expect(nock.isDone()).to.be.true;
    const monitoredApps = consoleLog.getCalls().map((call) => JSON.parse(call.args[0]).app);
    expect(monitoredApps).to.deep.equal(['application-1', 'application-4']);
  });

  it('should report metrics of the applications monitored for their database when listing every application fails', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    sinon.stub(config, 'SCALINGO_APPS').value(['application-1']);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value('*');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1').persist().get('/apps').reply(500, {});
    nock('https://api.REGION.scalingo.com/v1')
      .get('/apps/application-1/stats')
      .reply(200, { stats: [{ id: 'web-1', memory_usage: 200105984 }] });

    // when
    await taskAppMetrics();

    // then
    const monitoredApps = consoleLog
      .getCalls()
      .map((call) => JSON.parse(call.args[0]))
      .filter(({ event }) => event === 'app-metrics')
      .map(({ app }) => app);
    expect(monitoredApps).to.deep.equal(['application-1']);
  });

  it('should warn when monitoring the applications needs more requests than the Scalingo API allows', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    const apps = Array.from({ length: 60 }, (_, index) => ({ name: `application-${index}` }));
    sinon.stub(config, 'SCALINGO_APPS').value([]);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value('*');
    sinon.stub(config, 'APP_METRICS_SCHEDULE').value('*/30 * * * * *');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1').get('/apps').reply(200, { apps });
    nock('https://api.REGION.scalingo.com/v1')
      .persist()
      .get(/\/apps\/application-\d+\/stats/)
      .reply(200, { stats: [] });

    // when
    await taskAppMetrics();

    // then
    const { status, message, task } = JSON.parse(consoleLog.firstCall.args[0]);
    expect(status).to.equal('WARNING');
    expect(task).to.equal('app-metrics');
    expect(message).to.contain('122 Scalingo API requests per minute, above the 60 allowed');
  });

  it('should warn about the rate limit only once per process', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    const apps = Array.from({ length: 60 }, (_, index) => ({ name: `application-${index}` }));
    sinon.stub(config, 'SCALINGO_APPS').value([]);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value('*');
    sinon.stub(config, 'APP_METRICS_SCHEDULE').value('*/30 * * * * *');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1').persist().get('/apps').reply(200, { apps });
    nock('https://api.REGION.scalingo.com/v1')
      .persist()
      .get(/\/apps\/application-\d+\/stats/)
      .reply(200, { stats: [] });

    // when
    await taskAppMetrics();
    await taskAppMetrics();

    // then
    const warnings = consoleLog.getCalls().filter((call) => JSON.parse(call.args[0]).status === 'WARNING');
    expect(warnings).to.have.lengthOf(1);
  });

  it('should not warn when monitoring the applications stays within the Scalingo API rate limit', async function () {
    // given
    const consoleLog = sinon.stub(console, 'log');
    sinon.stub(config, 'SCALINGO_APPS').value(['application-1']);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value([]);
    sinon.stub(config, 'APP_METRICS_SCHEDULE').value('*/30 * * * * *');
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1').get('/apps/application-1/stats').reply(200, { stats: [] });

    // when
    await taskAppMetrics();

    // then
    expect(nock.isDone()).to.be.true;
    expect(consoleLog).to.not.have.been.called;
  });

  it('should report metrics only once for an application listed both as a database and as an additional application', async function () {
    // given

    const consoleLog = sinon.stub(console, 'log');
    sinon.stub(config, 'SCALINGO_APPS').value(['application-1']);
    sinon.stub(config, 'SCALINGO_ADDITIONAL_APPS').value(['application-1']);
    nock('https://auth.scalingo.com/v1').persist().post('/tokens/exchange').reply(200, { token: 'my-token' });
    nock('https://api.REGION.scalingo.com/v1')
      .get(`/apps/application-1/stats`)
      .reply(200, { stats: [{ id: 'web-1', memory_usage: 200105984 }] });

    // when
    await taskAppMetrics();

    // then
    expect(nock.isDone()).to.be.true;
    expect(consoleLog).to.have.been.calledOnce;
  });
});
