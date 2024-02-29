import {
  getAvailableDatabases,
  getDBMetrics,
  getPgQueriesMetric,
  getPgQueryStats,
} from '../../../lib/infrastructure/database-stats-repository.js';
import { expect, sinon, nock } from '../../test-helper.js';
import config from '../../../config.js';

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
        {
          id: '5415beca646173000b015002',
          addon_provider: {
            id: 'other',
          },
        },
      ]);
      const scalingoApi = { getAddons: getAddonsStub };

      // when
      const databases = await getAvailableDatabases(scalingoApi, scalingoApp);

      // then
      expect(getAddonsStub).to.have.been.calledOnceWithExactly(scalingoApp);
      expect(databases).to.eql([
        { name: 'postgresql', id: '5415beca646173000b015000' },
        { name: 'redis', id: '5415beca646173000b015001' },
      ]);
    });
  });

  describe('#getDbMetrics', function () {
    it('should return global metrics and specific metrics from the leader', async function () {
      // given
      const scalingoApp = 'my-application';
      const addonId = 'my-addon-id';
      const expectedMetrics = {
        database_stats: {
          data_size: 11044896,
        },
        leader_metrics: {
          cpu: 4,
          memory: {
            memory: 156426240,
            memory_max: 222314496,
            memory_limit: 536870912,
            swap: 20480,
            swap_max: 0,
            swap_limit: 536870912,
          },
          disk: { total: 120, used: 10 },
          diskio: { reads: 120, writes: 10 },
        },
      };
      const getDbMetricsStub = sinon.stub().resolves({
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
        instances_metrics: {
          'instance-leader': {
            memory: {
              memory: 156426240,
              memory_max: 222314496,
              memory_limit: 536870912,
              swap: 20480,
              swap_max: 0,
              swap_limit: 536870912,
            },
            cpu: {
              usage_in_percents: 4,
            },
          },
        },
      });
      const getInstancesStatusStub = sinon.stub().resolves([
        {
          id: 'gateway',
          type: 'gateway',
          status: 'running',
          role: '',
        },
        {
          id: 'instance-leader',
          type: 'db-node',
          status: 'running',
          role: 'leader',
        },
        {
          id: 'instance-follower1',
          type: 'db-node',
          status: 'running',
          role: 'follower',
        },
        {
          id: 'instance-follower2',
          type: 'db-node',
          status: 'running',
          role: 'follower',
        },
      ]);
      const getDbDiskStub = sinon.stub().resolves({ disk_total: 120, disk_used: 10 });
      const getDbDiskIOStub = sinon.stub().resolves({ diskio_reads: 120, diskio_writes: 10 });
      const scalingoApi = {
        getDbMetrics: getDbMetricsStub,
        getInstancesStatus: getInstancesStatusStub,
        getDbDisk: getDbDiskStub,
        getDbDiskIO: getDbDiskIOStub,
      };

      // when
      const metrics = await getDBMetrics(scalingoApi, scalingoApp, addonId);

      // then
      expect(getDbMetricsStub).to.have.been.calledOnceWithExactly(scalingoApp, addonId);
      expect(getInstancesStatusStub).to.have.been.calledOnceWithExactly(scalingoApp, addonId);
      expect(getDbDiskStub).to.have.been.calledOnceWithExactly(scalingoApp, addonId, 'instance-leader');
      expect(getDbDiskIOStub).to.have.been.calledOnceWithExactly(scalingoApp, addonId, 'instance-leader');
      expect(metrics).to.eql(expectedMetrics);
    });
  });

  describe('#getPgQueriesMetric', function () {
    const idleQuery = {
      state: 'idle',
      query: 'SELECT IDLE',
      query_duration: 100,
      username: 'database_user',
      pid: 2,
    };
    const activeQuery = {
      state: 'active',
      query: 'SELECT SLOW',
      // eslint-disable-next-line mocha/no-setup-in-describe
      query_duration: config.SLOW_QUERY_DURATION_NANO_THRESHOLD + 1,
      username: 'database_user',
      pid: 42,
    };

    describe('Given running query with less than 250', function () {
      it('should not truncate the returned query', async function () {
        // given
        const scalingoApp = 'application';
        const getPgRunningQueriesStub = sinon.stub();
        const expected = 'S'.repeat(249);
        getPgRunningQueriesStub.resolves({
          result: [{ ...activeQuery, query: 'S'.repeat(249) }, idleQuery],
        });
        const scalingoApi = { getPgRunningQueries: getPgRunningQueriesStub };

        // when
        const response = await getPgQueriesMetric(scalingoApi, scalingoApp);

        // then
        expect(getPgRunningQueriesStub).to.have.been.calledOnceWithExactly(scalingoApp);
        expect(response.slowQueries[0].query).to.equal(expected);
      });
    });

    describe('Given running query with a length greater than 250', function () {
      it('should truncate the returned query', async function () {
        // given
        const scalingoApp = 'application';
        const getPgRunningQueriesStub = sinon.stub();
        const expected = 'S'.repeat(250) + '...';
        getPgRunningQueriesStub.resolves({
          result: [
            {
              ...activeQuery,
              query: 'S'.repeat(251),
            },
            idleQuery,
          ],
        });
        const scalingoApi = { getPgRunningQueries: getPgRunningQueriesStub };

        // when
        const response = await getPgQueriesMetric(scalingoApi, scalingoApp);

        // then
        expect(getPgRunningQueriesStub).to.have.been.calledOnceWithExactly(scalingoApp);
        expect(response.slowQueries[0].query).to.equal(expected);
      });
    });

    describe('Given running queries around the slow threshold', function () {
      it('should return only the slow query', async function () {
        // given
        const scalingoApp = 'application';
        const getPgRunningQueriesStub = sinon.stub();
        const expected = {
          activeQueriesCount: 2,
          slowQueries: [
            {
              query: 'SELECT SLOW',
            },
          ],
        };
        getPgRunningQueriesStub.resolves({
          result: [
            {
              ...activeQuery,
              query: 'SELECT FAST',
              query_duration: config.SLOW_QUERY_DURATION_NANO_THRESHOLD - 1,
            },
            {
              ...activeQuery,
            },
            idleQuery,
          ],
        });
        const scalingoApi = { getPgRunningQueries: getPgRunningQueriesStub };

        // when
        const response = await getPgQueriesMetric(scalingoApi, scalingoApp);

        // then
        expect(getPgRunningQueriesStub).to.have.been.calledOnceWithExactly(scalingoApp);
        expect(response.activeQueriesCount).to.equal(expected.activeQueriesCount);
        expect(response.slowQueries[0].query).to.equal(expected.slowQueries[0].query);
      });
    });

    it('should call scalingoApi.getPgRunningQueries and return active queries count and slow queries list', async function () {
      // given
      const scalingoApp = 'application';
      const getPgRunningQueriesStub = sinon.stub();
      const expected = {
        activeQueriesCount: 1,
        slowQueriesCount: 1,
        slowQueries: [{ query: 'SELECT SLOW', duration: 300000000001, usr: 'database_user', pid: 42 }],
      };
      getPgRunningQueriesStub.resolves({
        result: [activeQuery, idleQuery],
      });
      const scalingoApi = { getPgRunningQueries: getPgRunningQueriesStub };

      // when
      const response = await getPgQueriesMetric(scalingoApi, scalingoApp);

      // then
      expect(getPgRunningQueriesStub).to.have.been.calledOnceWithExactly(scalingoApp);
      expect(response).to.deep.equal(expected);
    });
  });

  describe('#getPgQueryStats', function () {
    it('should call scalingoApi.getPgQueryStats and return result', async function () {
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
      const response = await getPgQueryStats(scalingoApp);

      // then
      expect(tokenNock.calledOnceWithExactly);
      expect(addonIdNock.calledOnceWithExactly);
      expect(addonTokenNock.calledOnceWithExactly);
      expect(statsNock.calledOnceWithExactly);
      expect(response).to.deep.equal(queryStats);
    });
  });
});
