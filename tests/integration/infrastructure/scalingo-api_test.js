const {
  getDbMetrics,
  getAddons,
  getInstancesStatus,
  getRunningQueries,
  getDbDisk,
} = require('../../../lib/infrastructure/scalingo-api');
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

  describe('#getDbMetrics', function () {
    it('should call the db metrics API', async function () {
      // given
      const application = 'my-application';
      const addonId = 'my-addon-id';
      const expectedMetrics = { cpu_usage: 0 };

      nock('https://auth.scalingo.com/v1').post(`/tokens/exchange`).reply(200, { token: 'my-token' });

      nock('https://api.REGION.scalingo.com/v1', {
        reqheaders: {
          authorization: 'Bearer my-token',
        },
      })
        .post(`/apps/${application}/addons/${addonId}/token`)
        .reply(200, { addon: { token: 'my-database-token' } });

      nock('https://db-api.REGION.scalingo.com', {
        reqheaders: {
          authorization: 'Bearer my-database-token',
        },
      })
        .get(`/api/databases/${addonId}/metrics`)
        .reply(200, expectedMetrics);

      // when
      const metrics = await getDbMetrics(application, addonId);

      // then
      expect(nock.isDone()).to.be.true;
      expect(metrics).to.eql(expectedMetrics);
    });
  });

  describe('#getInstancesStatus', function () {
    it('should call the instances status API', async function () {
      // given
      const application = 'my-application';
      const addonId = 'my-addon-id';
      const expectedStatus = [{ id: '1' }];

      nock('https://auth.scalingo.com/v1').post(`/tokens/exchange`).reply(200, { token: 'my-token' });

      nock('https://api.REGION.scalingo.com/v1', {
        reqheaders: {
          authorization: 'Bearer my-token',
        },
      })
        .post(`/apps/${application}/addons/${addonId}/token`)
        .reply(200, { addon: { token: 'my-database-token' } });

      nock('https://db-api.REGION.scalingo.com', {
        reqheaders: {
          authorization: 'Bearer my-database-token',
        },
      })
        .get(`/api/databases/${addonId}/instances_status`)
        .reply(200, expectedStatus);

      // when
      const instancesStatus = await getInstancesStatus(application, addonId);

      // then
      expect(nock.isDone()).to.be.true;
      expect(instancesStatus).to.eql(expectedStatus);
    });
  });

  describe('#getDbDisk', function () {
    it('should call the getDbDisk API', async function () {
      // given
      const application = 'my-application';
      const addonId = 'my-addon-id';
      const leaderNodeId = 'my-leader-id';
      const expectedMetrics = [{ id: '1' }];

      nock('https://auth.scalingo.com/v1').post(`/tokens/exchange`).reply(200, { token: 'my-token' });

      nock('https://api.REGION.scalingo.com/v1', {
        reqheaders: {
          authorization: 'Bearer my-token',
        },
      })
        .post(`/apps/${application}/addons/${addonId}/token`)
        .reply(200, { addon: { token: 'my-database-token' } });

      nock('https://db-api.REGION.scalingo.com', {
        reqheaders: {
          authorization: 'Bearer my-database-token',
        },
      })
        .get(`/api/databases/${addonId}/instances/${leaderNodeId}/metrics/disk`)
        .query({ since: 3, last: true })
        .reply(200, { disk_metrics: [expectedMetrics] });

      // when
      const metrics = await getDbDisk(application, addonId, leaderNodeId);

      // then
      expect(nock.isDone()).to.be.true;
      expect(metrics).to.eql(expectedMetrics);
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
