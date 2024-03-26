import pg from 'pg';
import { expect, nock } from '../../test-helper.js';
import { getBlockingQueries, logBlockingQueries } from '../../../lib/application/task-blocking-queries.js';
import config from '../../../config.js';

const Client = pg.Client;
const { DATABASE_URL } = config;
async function createTable() {
  const client = new Client(DATABASE_URL);
  try {
    await client.connect();
    await client.query('CREATE TABLE blocking_table (id int, name varchar(2), value int);');
  } finally {
    await client.end();
  }
}

async function cleanupTable() {
  const client = new Client(DATABASE_URL);
  try {
    await client.connect();
    await client.query(`DROP TABLE blocking_table CASCADE;`);
  } finally {
    await client.end();
  }
}

async function execute(client = new Client(DATABASE_URL), query) {
  await client.connect();
  await client.query(query);
}

describe('#getBlockingQueries', function () {
  beforeEach(async function () {
    await createTable();
  });

  afterEach(async function () {
    await cleanupTable();
  });

  it('should return metrics', async function () {
    // given
    const client1 = new Client(DATABASE_URL);
    const client2 = new Client(DATABASE_URL);
    await execute(client1, 'BEGIN; ALTER TABLE blocking_table DROP COLUMN value;');
    execute(client2, 'INSERT into blocking_table VALUES (1, "tt" , 12) ;');

    // when
    const result = await getBlockingQueries(DATABASE_URL);

    // then
    await client1.end();
    await client2.end();

    expect(result.length).to.equal(1);

    expect(result[0]).to.include({
      waiting_locktype: 'relation',
      waiting_table: 'blocking_table',
      waiting_query: 'INSERT into blocking_table VALUES (1, "tt" , 12) ;',
      waiting_mode: 'RowExclusiveLock',
      blocking_locktype: 'relation',
      blocking_table: 'blocking_table',
      blocking_query: 'BEGIN; ALTER TABLE blocking_table DROP COLUMN value;',
      blocking_mode: 'AccessExclusiveLock',
      blocking_granted: true,
      waiting_usr: 'user',
      blocking_usr: 'user',
    });
    expect(result[0].waiting_for_lock_start).to.be.a('date');
    expect(result[0].waiting_for_lock_duration).to.be.a('number');
    expect(result[0].blocking_duration).to.be.a('number');
    expect(result[0].waiting_duration).to.be.a('number');
    expect(result[0].blocking_pid).to.be.a('number');
    expect(result[0].waiting_pid).to.be.a('number');
  });
});

// eslint-disable-next-line mocha/max-top-level-suites
describe('#logBlockingQueries', function () {
  it('should not throw an error when API Scalingo fails', async function () {
    let hasThrown = false;
    // when
    nock(`https://auth.scalingo.com`).persist().post('/v1/tokens/exchange').reply(401, {
      token: 'myfaketoken',
      error: 'Invalid credentials',
    });

    try {
      await logBlockingQueries();
    } catch (error) {
      hasThrown = true;
    }
    // then
    expect(hasThrown).to.be.false;
  });
});
