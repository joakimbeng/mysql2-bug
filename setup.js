import {GenericContainer} from 'testcontainers';

let container;

export async function setup() {
  container = await new GenericContainer('mysql:8.0')
    .withEnvironment({
      MYSQL_ROOT_PASSWORD: 'test',
      MYSQL_USER: 'test',
      MYSQL_PASSWORD: 'test',
      MYSQL_DATABASE: 'test',
    })
    .withCommand([
      'mysqld',
      '--sql-mode=NO_ENGINE_SUBSTITUTION',
      '--character-set-server=utf8',
      '--default-authentication-plugin=mysql_native_password',
      '--disable-log-bin',
    ])
    .withExposedPorts(3306)
    .start();

  process.env['MYSQL_PORT'] = container.getMappedPort(3306).toString();
  process.env['MYSQL_HOST'] = container.getHost();
}

export async function teardown() {
  await container?.stop();
}
