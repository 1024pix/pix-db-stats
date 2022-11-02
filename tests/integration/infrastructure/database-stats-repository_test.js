const {
  getAvailableDatabases,
  getDBMetrics,
  getQueriesMetric,
  getQueryStats,
} = require('../../../lib/infrastructure/database-stats-repository');
const { expect, sinon, nock } = require('../../test-helper');

describe('database-stats-repository', function () {
  describe('#getAvailableDatabases', function () {
    it('should call scalingoApi.getAddons and return the postgres addon', async function () {
      // given
      const scalingoApp = 'my-application';
      const getAddonsStub = sinon.stub().resolves([
        {
          id: '5415beca646173000b015000',
          addon_provider: {
            id: 'postgresql',
          },
        },
        {
          id: '5415beca646173000b015001',
          addon_provider: {
            id: 'redis',
          },
        },
      ]);
      const scalingoApi = { getAddons: getAddonsStub };

      // when
      const databases = await getAvailableDatabases(scalingoApi, scalingoApp);

      // then
      expect(getAddonsStub).to.have.been.calledOnceWithExactly(scalingoApp);
      expect(databases).to.eql([{ name: 'postgresql', id: '5415beca646173000b015000' }]);
    });
  });

  describe('#getDbMetrics', function () {
    it('should call scalingoApi.getDbMetrics and return them', async function () {
      // given
      const scalingoApp = 'my-application';
      const addonId = 'my-addon-id';
      const expectedMetrics = {
        cpu_usage: 0,
        memory: {
          memory: 156426240,
          memory_max: 222314496,
          memory_limit: 536870912,
          swap: 20480,
          swap_max: 0,
          swap_limit: 536870912,
        },
        database_stats: {
          data_size: 11044896,
        },
      };
      const getDbMetricsStub = sinon.stub().resolves(expectedMetrics);
      const scalingoApi = { getDbMetrics: getDbMetricsStub };

      // when
      const metrics = await getDBMetrics(scalingoApi, scalingoApp, addonId);

      // then
      expect(getDbMetricsStub).to.have.been.calledOnceWithExactly(scalingoApp, addonId);
      expect(metrics).to.eql(expectedMetrics);
    });
  });

  describe('#getQueriesMetric', function () {
    it('should call scalingoApi.getRunningQueries and return and count number of active queries', async function () {
      // given
      const scalingoApp = 'application';
      const getRunningQueriesStub = sinon.stub();
      const expected = { activeQueriesCount: 1 };
      getRunningQueriesStub.resolves({
        result: [
          {
            state: 'active',
          },
          {
            state: 'idle',
          },
        ],
      });
      const scalingoApi = { getRunningQueries: getRunningQueriesStub };

      // when
      const response = await getQueriesMetric(scalingoApi, scalingoApp);

      // then
      expect(getRunningQueriesStub).to.have.been.calledOnceWithExactly(scalingoApp);
      expect(response).to.deep.equal(expected);
    });
  });

  describe('#getQueryStats', function () {
    it('should call scalingoApi.getQueryStats and return result', async function () {
      // given
      const queryStats = [
        {
          user_id: 1000,
          query: 'SELECT * FROM users',
          calls: 14512,
          rows: 1500,
          total_time: 1837.1,
          min_time: 10.2,
          max_time: 13.5,
          mean_time: 10.6,
          std_dev: 1.1,
        },
        {
          user_id: 2000,
          query: 'SELECT * FROM database',
          calls: 24512,
          rows: 2500,
          total_time: 21837.1,
          min_time: 20.2,
          max_time: 23.5,
          mean_time: 20.6,
          std_dev: 2.1,
        },
      ];

      const tokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {
        token: 'myfaketoken',
      });

      const addonIdNock = nock(`https://api.REGION.scalingo.com`)
        .get('/v1/apps/application-1/addons')
        .reply(200, {
          addons: [{ id: 'addonid', addon_provider: { id: 'postgresql' } }],
        });

      const addonTokenNock = nock('https://api.REGION.scalingo.com')
        .post('/v1/apps/application-1/addons/addonid/token')
        .reply(200, {
          addon: { token: 'myfaketoken' },
        });

      const statsNock = nock(`https://db-api.REGION.scalingo.com`).post('/api/databases/addonid/action').reply(200, {
        ok: 1,
        result: queryStats,
      });

      const scalingoApp = 'application-1';

      // when
      const response = await getQueryStats(scalingoApp);

      // then
      expect(tokenNock.calledOnceWithExactly);
      expect(addonIdNock.calledOnceWithExactly);
      expect(addonTokenNock.calledOnceWithExactly);
      expect(statsNock.calledOnceWithExactly);
      expect(response).to.deep.equal(queryStats);
    });
  });
});
