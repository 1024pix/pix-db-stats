const { expect, nock } = require('../../test-helper');
const task = require('../../../lib/application/task-statements');

describe('#task', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await task();
    } catch (error) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
