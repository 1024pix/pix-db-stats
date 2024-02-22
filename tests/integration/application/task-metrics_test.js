import testHelpers from '../../test-helper.js';
import taskMetrics from '../../../lib/application/task-metrics.js';

describe('#taskMetrics', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    testHelpers.nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskMetrics();
    } catch (error) {
      hasThrown = true;
    }
    // then
    testHelpers.expect(hasThrown).to.be.false;
  });
});
