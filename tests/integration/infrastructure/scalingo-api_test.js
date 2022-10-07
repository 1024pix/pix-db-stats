const { getRunningQueries } = require('../../../lib/infrastructure/scalingo-api');
const { expect, nock } = require('../../test-helper');

describe('scalingo-api', function () {
  describe('#getRunningQueries', function () {
    const scalingoApp = 'application';
    const addonId = 'addonId';
    const token = 'token';
    const getCredentials = () => {
      return { addonId, token };
    };
    const baseURL = 'https://db-api.REGION.scalingo.com';
    const MICROSECONDS_IN_SECONDS = 1 * 10 ** 6;
    const ONE_SECOND = 1 * MICROSECONDS_IN_SECONDS;
    describe('#queriesCount', function () {
      describe('when there is one running query', function () {
        it('should return 1', async function () {
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
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.queriesCount).to.deep.equal(1);
        });
      });
    });
    describe('#longQueries', function () {
      describe('when there is one long active query', function () {
        it('should return it', async function () {
          // given
          const queries = [
            {
              query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'idle',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19290,
              query_duration: ONE_SECOND,
            },
            {
              query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19297,
              query_duration: 1,
            },
            {
              query: 'SELECT * FROM users',
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
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.longQueries).to.deep.equal([
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: ONE_SECOND,
            },
          ]);
        });
      });
      describe('when there is no long running query', function () {
        it('should return an empty array', async function () {
          // given
          const queries = [
            {
              query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19297,
              query_duration: 1,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: ONE_SECOND - 1,
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
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.longQueries).to.be.an('array').that.is.empty;
        });
      });
    });
    describe('#NLongestQueries', function () {
      describe('when there is more active than N active queries', function () {
        it('should return only the N longest ones...', async function () {
          // given
          const queries = [
            {
              query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'idle',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19291,
              query_duration: ONE_SECOND,
            },
            {
              query: 'SELECT usename, query, state, query_start, pid FROM pg_stat_activity',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T14:20:05.328404Z',
              pid: 19296,
              query_duration: 1,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19291,
              query_duration: 4,
            },
            {
              query: 'SELECT * FROM users',
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
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.NLongestQueries).to.deep.equal([
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19291,
              query_duration: 4,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
          ]);
        });
      });
      describe('when there is less than N active queries', function () {
        it('should return all queries, sorted by descending duration', async function () {
          // given
          const queries = [
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
            {
              query: 'SELECT * FROM users',
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
          nock(baseURL)
            .post(`/api/databases/${addonId}/action`, {
              action_name: 'pg-list-queries',
            })
            .reply(200, scalingoResponse);

          // when
          const response = await getRunningQueries(scalingoApp, getCredentials);

          // then
          expect(response.NLongestQueries).to.deep.equal([
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19298,
              query_duration: 3,
            },
            {
              query: 'SELECT * FROM users',
              state: 'active',
              username: 'admin',
              query_start: '2022-09-28T11:20:05.328404Z',
              pid: 19297,
              query_duration: 2,
            },
          ]);
        });
      });
    });
  });
});
