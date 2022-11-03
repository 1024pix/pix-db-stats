const taskQueriesMetric = require('../../../lib/application/task-queries-metric');
const { expect, sinon, nock } = require('../../test-helper');

describe('#task-queries-metric', function () {
  it('should call queries metric once for each application', async function () {
    // given
    const expected = { queriesCount: 1 };
    const getPgQueriesMetricStub = sinon.stub().resolves(expected);
    const databaseStatsRepository = {
      getPgQueriesMetric: getPgQueriesMetricStub,
    };
    const scalingoApi = sinon.stub();

    // when
    await taskQueriesMetric.run(databaseStatsRepository, scalingoApi);

    // then
    expect(getPgQueriesMetricStub.firstCall.args[0]).to.equal(scalingoApi);
    expect(getPgQueriesMetricStub.firstCall.args[1]).to.equal('application-1');
    expect(getPgQueriesMetricStub.secondCall.args[0]).to.equal(scalingoApi);
    expect(getPgQueriesMetricStub.secondCall.args[1]).to.equal('application-2');
  });

  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // given
    const expected = { queriesCount: 1 };
    const getPgQueriesMetricStub = sinon.stub().resolves(expected);
    const databaseStatsRepository = {
      getPgQueriesMetric: getPgQueriesMetricStub,
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
