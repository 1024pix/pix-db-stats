const { Client } = require('pg');
const { expect } = require('../../test-helper');
const { getBlockingQueries, logBlockingQueries } = require('../../../lib/application/task-blocking-queries');
const { DATABASE_URL } = require('../../../config');

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

    expect(result.length).to.equal(2);
    expect(result[0]).to.include({
      waiting_locktype: 'relation',
      waiting_table: 'blocking_table',
      waiting_query: 'BEGIN; ALTER TABLE blocking_table DROP COLUMN value;',
      waiting_mode: 'AccessExclusiveLock',
      blocking_locktype: 'relation',
      blocking_table: 'blocking_table',
      blocking_query: 'INSERT into blocking_table VALUES (1, "tt" , 12) ;',
      blocking_mode: 'RowExclusiveLock',
      blocking_granted: false,
    });
    expect(result[0].blocking_duration).to.be.a('number');
    expect(result[0].blocking_pid).to.be.a('number');
    expect(result[0].waiting_pid).to.be.a('number');

    expect(result[1]).to.include({
      waiting_locktype: 'relation',
      waiting_table: 'blocking_table',
      waiting_query: 'INSERT into blocking_table VALUES (1, "tt" , 12) ;',
      waiting_mode: 'RowExclusiveLock',
      blocking_locktype: 'relation',
      blocking_table: 'blocking_table',
      blocking_query: 'BEGIN; ALTER TABLE blocking_table DROP COLUMN value;',
      blocking_mode: 'AccessExclusiveLock',
      blocking_granted: true,
    });
    expect(result[1].blocking_duration).to.be.a('number');
    expect(result[1].blocking_pid).to.be.a('number');
    expect(result[1].waiting_pid).to.be.a('number');
  });
});
