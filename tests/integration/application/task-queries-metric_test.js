const taskQueriesMetric = require('../../../lib/application/task-queries-metric');
const { expect, sinon, nock } = require('../../test-helper');

describe('task-queries-metric', function () {
  it('should call queries metric once for each application', async function () {
    // given
    const expected = { queriesCount: 1 };
    const getQueriesMetricStub = sinon.stub().resolves(expected);
    const databaseStatsRepository = {
      getQueriesMetric: getQueriesMetricStub,
    };
    const scalingoApi = sinon.stub();

    // when
    await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);

    // then
    expect(getQueriesMetricStub.firstCall.args[0]).to.equal(scalingoApi);
    expect(getQueriesMetricStub.firstCall.args[1]).to.equal('application-1');
    expect(getQueriesMetricStub.secondCall.args[0]).to.equal(scalingoApi);
    expect(getQueriesMetricStub.secondCall.args[1]).to.equal('application-2');
  });
});
describe('#task-queries-metric', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // given
    const getQueriesMetricStub = sinon.stub();
    const expected = { queriesCount: 1, longQueriesCount: 0 };
    getQueriesMetricStub.resolves(expected);
    const databaseStatsRepository = {
      getRunningQueries: getQueriesMetricStub,
    };
    const scalingoApi = sinon.stub();
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);
    } catch (error) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
