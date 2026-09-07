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
