const taskRunningQueries = require('../../../lib/application/task-running-queries');
const { expect, sinon } = require('../../test-helper');

describe('task-running-queries', () => {
  it('should do call running queries once for every applications', async () => {
    // given
    const getRunningQueriesStub = sinon.stub();
    getRunningQueriesStub.resolves({ queriesCount: 1 });
    const databaseStatsRepository = {
      getRunningQueries: getRunningQueriesStub,
    };

    // when
    await taskRunningQueries(databaseStatsRepository);
    // then
    expect(getRunningQueriesStub.firstCall.args[1]).to.equal('application-1');
    expect(getRunningQueriesStub.secondCall.args[1]).to.equal('application-2');
  });
});
