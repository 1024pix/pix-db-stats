const {
  getRunningQueries,
} = require('../../../lib/infrastructure/scalingo-api');
const { expect, nock } = require('../../test-helper');

describe('scalingo-api', () => {
  describe('#getRunningQueries', () => {
    describe('#queriesCount', () => {
      describe('when there is one running query', () => {
        it('should return 1', async () => {
          // given
          const addonId = 'addonId';
          const token = 'token';
          const getCredentials = () => {
            return { addonId, token };
          };
          const baseURL = 'https://db-api.REGION.scalingo.com';
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
              query:
                'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
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
          const scalingoApp = 'application';
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.queriesCount).to.deep.equal(1);
        });
      });
    });
    describe('#longQueries', () => {
      describe('when there is one long running query', () => {
        it('should return it', async () => {
          // given
          const addonId = 'addonId';
          const token = 'token';
          const getCredentials = () => {
            return { addonId, token };
          };
          const baseURL = 'https://db-api.REGION.scalingo.com';
          const MICROSECONDS_IN_SECONDS = 1 * 10 ** 6;
          const ONE_SECOND = 1 * MICROSECONDS_IN_SECONDS;

          const queries = [
            {
              query:
                'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19297,
              query_duration: 1,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: ONE_SECOND,
            },

          ];
          const scalingoResponse = {
            result: queries,
          };
          const scalingoApp = 'application';
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.longQueries).to.deep.equal( [{
            query:
              'SELECT * FROM users',
            state: 'active',
            username: 'admin',
            query_start: '2022-09-28T11:20:05.328404Z',
            pid: 19297,
            query_duration: ONE_SECOND,
          }]);
        });
      });
      describe('when there is no long running query', () => {
        it('should return an empty array', async () => {
          // given
          const addonId = 'addonId';
          const token = 'token';
          const getCredentials = () => {
            return { addonId, token };
          };
          const baseURL = 'https://db-api.REGION.scalingo.com';
          const MICROSECONDS_IN_SECONDS = 1 * 10 ** 6;
          const ONE_SECOND = 1 * MICROSECONDS_IN_SECONDS;
          const queries = [
            {
              query:
                'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19297,
              query_duration: 1,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: ONE_SECOND - 1 ,
            },

          ];
          const scalingoResponse = {
            result: queries,
          };
          const scalingoApp = 'application';
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.longQueries).to.be.an( "array" ).that.is.empty;
        });
      });
    });
    describe('#topNQueries', () => {
      describe('when there is more active than N active queries', () => {
        it('should return only the N longest ones...', async () => {
          // given
          const addonId = 'addonId';
          const token = 'token';
          const getCredentials = () => {
            return { addonId, token };
          };
          const baseURL = 'https://db-api.REGION.scalingo.com';

          const queries = [
            {
              query:
                'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19296,
              query_duration: 1,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19291,
              query_duration: 4,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
          ];
          const scalingoResponse = {
            result: queries,
          };
          const scalingoApp = 'application';
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.topNQueries).to.deep.equal( [
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19291,
              query_duration: 4,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
            {
            query:
              'SELECT * FROM users',
            state: 'active',
            username: 'admin',
            query_start: '2022-09-28T11:20:05.328404Z',
            pid: 19297,
            query_duration: 2,
          }]);
        });
      });
      describe('when there is less than N active queries', () => {
        it('should return all queries, sorted by descending duration', async () => {
          // given
          const addonId = 'addonId';
          const token = 'token';
          const getCredentials = () => {
            return { addonId, token };
          };
          const baseURL = 'https://db-api.REGION.scalingo.com';

          const queries = [
             {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
          ];
          const scalingoResponse = {
            result: queries,
          };
          const scalingoApp = 'application';
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.topNQueries).to.deep.equal( [
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
            {
              query:
                'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            }]);
        });
      });
    });
  });
});
