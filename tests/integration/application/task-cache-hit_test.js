import { expect, nock } from '../../test-helper.js';
import { getCacheHit, logCacheHits } from '../../../lib/application/task-cache-hit.js';
import config from '../../../config.js';

const { DATABASE_URL } = config;
describe('#getCacheHit', function () {
  it('should return a positive percentage', async function () {
    // when
    const result = await getCacheHit(DATABASE_URL);

    // then
    expect(result).to.be.a('number');
    expect(result).to.be.at.least(0);
    expect(result).to.be.at.most(100);
  });
});

// eslint-disable-next-line mocha/max-top-level-suites
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
    } catch (_) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
