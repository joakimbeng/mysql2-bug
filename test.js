import {before, after, test} from 'node:test';
import assert from 'node:assert';
import {createConnection} from 'mysql2/promise';
import {setup, teardown} from './setup.js';

let db;

before(async () => {
  await setup();
  console.log(process.env.MYSQL_HOST, process.env.MYSQL_PORT);
  db = await createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT),
    user: 'test',
    password: 'test',
    database: 'test',
    typeCast(_field, next) {
      const value = next();

      if (value === null) {
        return undefined;
      }

      return value;
    },
  });

  await db.query(
    'CREATE TABLE test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), value INT)'
  );

  await db.query('INSERT INTO test_table (name, value) VALUES (?, ?)', [
    'first',
    1,
  ]);
  await db.query('INSERT INTO test_table (name, value) VALUES (?, ?)', [
    'second',
    null,
  ]);
});

after(teardown);

test('type cast NULL to UNDEFINED for "query" method', async (t) => {
  const [rows] = await db.query('SELECT * FROM test_table');

  assert.strictEqual(rows[0].value, 1);
  assert.strictEqual(rows[1].value, undefined);
});

test('type cast NULL to UNDEFINED for "execute" method', async (t) => {
  const [rows] = await db.execute('SELECT * FROM test_table');

  assert.strictEqual(rows[0].value, 1);
  assert.strictEqual(rows[1].value, undefined);
});
