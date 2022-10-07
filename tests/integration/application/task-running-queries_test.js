const taskRunningQueries = require('../../../lib/application/task-running-queries');
const { expect, sinon } = require('../../test-helper');

describe('task-running-queries', function () {
  it('should call running queries once for each application', async function () {
    // given
    const getRunningQueriesStub = sinon.stub();
    const expected = { queriesCount: 1, longQueriesCount: 0 };
    getRunningQueriesStub.resolves(expected);
    const databaseStatsRepository = {
      getRunningQueries: getRunningQueriesStub,
    };
    const scalingoApi = sinon.stub();

    // when
    await taskRunningQueries.run(databaseStatsRepository, scalingoApi);

    // then
    expect(getRunningQueriesStub.firstCall.args[0]).to.equal(scalingoApi);
    expect(getRunningQueriesStub.firstCall.args[1]).to.equal('application-1');
    expect(getRunningQueriesStub.secondCall.args[0]).to.equal(scalingoApi);
    expect(getRunningQueriesStub.secondCall.args[1]).to.equal('application-2');
  });
});
