const { expect, nock } = require('../../test-helper');
const taskMetrics = require('../../../lib/application/task-metrics');

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
    } catch (error) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
