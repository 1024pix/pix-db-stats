const { getAddons, getRunningQueries } = require('../../../lib/infrastructure/scalingo-api');
const { expect, nock } = require('../../test-helper');

describe('scalingo-api', function () {
  describe('#getAddons', function () {
    it('should returns addons of an application', async function () {
      // given
      const application = 'my-application';
      const addons = [];
      nock('https://auth.scalingo.com/v1').post(`/tokens/exchange`).reply(200, { token: 'my-token' });

      nock('https://api.REGION.scalingo.com/v1', {
        reqheaders: {
          authorization: 'Bearer my-token',
        },
      })
        .get(`/apps/${application}/addons`)
        .reply(200, { addons });

      // when
      const addonsResponse = await getAddons(application);

      // then
      expect(nock.isDone()).to.be.true;
      expect(addonsResponse).to.deep.equal(addons);
    });
  });

  describe('#getRunningQueries', function () {
    const scalingoApp = 'application';
    const addonId = 'addonId';
    const token = 'token';
    const getCredentials = () => {
      return { addonId, token };
    };
    const baseURL = 'https://db-api.REGION.scalingo.com';

    it('should returns the running queries', async function () {
      // given
      const queries = [
        {
          query:
            '/* path: /api/campaigns/{id} */ select "stages".* from "stages" inner join "campaigns" on "campaigns"."targetProfileId" = "stages"."targetProfileId" where "campaigns"."id" = $1 order by "stages"."threshold" asc',
          state: 'idle',
          username: 'pix_api_prod_4785',
          query_start: '2022-09-28T12:39:56.626151Z',
          pid: 25602,
          query_duration: 28787165146,
        },
        {
          query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
          state: 'active',
          username: 'admin',
          query_start: '2022-09-28T14:20:05.328404Z',
          pid: 19297,
          query_duration: 4351262,
        },
      ];
      const scalingoResponse = {
        result: queries,
      };

      nock(baseURL)
        .post(`/api/databases/${addonId}/action`, {
          action_name: 'pg-list-queries',
        })
        .reply(200, scalingoResponse);

      // when
      const stats = await getRunningQueries(scalingoApp, getCredentials);

      // then
      expect(stats).to.deep.equal(scalingoResponse);
    });
  });
});
