const { expect, sinon } = require("../../test-helper");

describe("Integration | schedule-task", () => {
  let clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  describe("running-queries", () => {
    it.skip("should extract them periodically, but does not (bug)", () => {
      // given
      const ONE_SECOND = 1 * 10**3;
      const taskRunningQueries = require("../../../lib/application/task-running-queries");
      const runStub = sinon.stub();
      const run = taskRunningQueries.run;
      taskRunningQueries.run = runStub;

      // when
      require("../../../lib/application/schedule-tasks");

      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(ONE_SECOND - 1);

      // then
      expect(runStub).to.not.have.been.called;

      // when
      clock.tick(1);

      // then
      expect(runStub).to.have.been.calledOnce;
      taskRunningQueries.run = run;
    });
  });
});
