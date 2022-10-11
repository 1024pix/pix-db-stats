const taskQueriesMetric = require('../../../lib/application/task-queries-metric');
const { expect, sinon } = require('../../test-helper');

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
