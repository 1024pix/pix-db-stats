const { expect, nock } = require('../../test-helper');
const taskResponseTime = require('../../../lib/application/task-response-time');

describe('#taskResponseTime', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await taskResponseTime();
    } catch (error) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
