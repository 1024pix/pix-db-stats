import { expect, nock } from '../../test-helper.js';
import taskMetrics from '../../../lib/application/task-metrics.js';

describe('#taskMetrics', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskMetrics();
    } catch (_) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
