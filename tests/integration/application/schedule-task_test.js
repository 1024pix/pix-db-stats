import { expect, sinon } from '../../test-helper.js';

describe('Integration | schedule-task', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('queries-metric', function () {
    it('should extract them periodically', function () {
      // given
      const ONE_SECOND = 1 * 10 ** 3;
      const taskQueriesMetric = require('../../../lib/application/task-queries-metric');
      const runStub = sinon.stub();
      const run = taskQueriesMetric.run;
      taskQueriesMetric.run = runStub;

      // when
      require('../../../lib/application/schedule-tasks');

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
      taskQueriesMetric.run = run;
    });
  });
});
