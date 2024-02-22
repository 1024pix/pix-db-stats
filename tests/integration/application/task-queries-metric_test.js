import taskQueriesMetric from '../../../lib/application/task-queries-metric.js';
import testHelpers from '../../test-helper.js';

describe('#task-queries-metric', function () {
  it('should call queries metric once for each application', async function () {
    // given
    const expected = { queriesCount: 1 };
    const getPgQueriesMetricStub = testHelpers.sinon.stub().resolves(expected);
    const databaseStatsRepository = {
      getPgQueriesMetric: getPgQueriesMetricStub,
    };
    const scalingoApi = testHelpers.sinon.stub();

    // when
    await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);

    // then
    testHelpers.expect(getPgQueriesMetricStub.firstCall.args[0]).to.equal(scalingoApi);
    testHelpers.expect(getPgQueriesMetricStub.firstCall.args[1]).to.equal('application-1');
    testHelpers.expect(getPgQueriesMetricStub.secondCall.args[0]).to.equal(scalingoApi);
    testHelpers.expect(getPgQueriesMetricStub.secondCall.args[1]).to.equal('application-2');
  });

  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // given
    const expected = { queriesCount: 1 };
    const getPgQueriesMetricStub = testHelpers.sinon.stub().resolves(expected);
    const databaseStatsRepository = {
      getPgQueriesMetric: getPgQueriesMetricStub,
    };
    const scalingoApi = testHelpers.sinon.stub();
    // when
    testHelpers.nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
    } catch (error) {
      hasThrown = true;
    }
    // then
    testHelpers.expect(hasThrown).to.be.false;
  });
});
