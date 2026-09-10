import { expect, sinon } from '../../test-helper.js';
import { schedule } from '../../../lib/application/schedule-tasks.js';

describe('Integration | schedule-task', function () {
  let clock;
  let scheduledJobs;

  beforeEach(function () {
    clock = sinon.useFakeTimers();
    scheduledJobs = [];
  });

  // Jobs outliving the test would keep running, on real timers, during the
  // next ones
  afterEach(function () {
    scheduledJobs.forEach((job) => job.stop());
    clock.restore();
  });

  describe('queries-metric', function () {
    it('should extract them periodically', function () {
      // given
      const ONE_SECOND = 1 * 10 ** 3;
      const runStub = sinon.stub().resolves();

      // when
      scheduledJobs = schedule({ runCommand: runStub });

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
    });
  });
});
