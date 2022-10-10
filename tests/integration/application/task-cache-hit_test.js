const { expect, nock } = require('../../test-helper');
const { getCacheHit, logCacheHits } = require('../../../lib/application/task-cache-hit');
const { TEST_DATABASE_URL: connexionString } = require('../../../config');

describe('#getCacheHit', function () {
  it('should return a positive percentage', async function () {
    // when
    const result = await getCacheHit(connexionString);

    // then
    expect(result).to.be.a('number');
    expect(result).to.be.at.least(0);
    expect(result).to.be.at.most(100);
  });
});

describe('#logCacheHits', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await logCacheHits();
    } catch (error) {
      console.log(error);
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
