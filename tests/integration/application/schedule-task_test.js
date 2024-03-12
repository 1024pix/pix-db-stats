import { expect, sinon } from '../../test-helper.js';
import * as taskQueriesMetrics from '../../../lib/application/task-queries-metric.js';
import * as scheduleTask from '../../../lib/application/schedule-tasks.js';
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
      const taskQueriesMetric = JSON.parse(JSON.stringify(taskQueriesMetrics));
      const runStub = sinon.stub();
      const run = taskQueriesMetric.run;
      taskQueriesMetric.run = runStub;

      // when
      scheduleTask;

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
