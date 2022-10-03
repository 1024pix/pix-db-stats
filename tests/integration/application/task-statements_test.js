const taskStatements = require('../../../lib/application/task-statements');
const { expect, sinon } = require('../../test-helper');

describe('task-statements', () => {
  it('should do call statements stats and reset once for every applications', async () => {
    // given
    const getQueryStatsStub = sinon.stub();
    const expected = [
        {
            "user_id": 1,
            "query": "SELECT pg_sleep($1)",
            "calls": 177,
            "rows": 177,
            "total_time": 152.0,
            "min_time": 100.1,
            "max_time": 1000.5,
            "mean_time": 165.3,
            "stddev_time": 12.215
        },
        {
            "user_id": 1,
            "query": "SELECT data FROM database",
            "calls": 260474,
            "rows": 260474,
            "total_time": 200.0,
            "min_time": 20.1,
            "max_time": 2000.5,
            "mean_time": 250.3,
            "stddev_time": 22.215
        }
      ];
    getQueryStatsStub.resolves(expected);

    const resetQueryStatsStub = sinon.stub();
    const expectedresetQueryStatsStub = {
      "ok": 1,
      "error": ""
    };
    resetQueryStatsStub.resolves(expectedresetQueryStatsStub);

    const databaseStatsRepository = {
      getQueryStats: getQueryStatsStub,
      resetQueryStats: resetQueryStatsStub,
    };

    // when
    await taskStatements(databaseStatsRepository);
    // then

    expect(getQueryStatsStub.firstCall.args['0']).to.equal('application-1');
    expect(getQueryStatsStub.secondCall.args['0']).to.equal('application-2');
    expect(resetQueryStatsStub.firstCall.args['0']).to.equal('application-1');
    expect(resetQueryStatsStub.secondCall.args['0']).to.equal('application-2');

  });
});
