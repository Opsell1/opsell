import pg from "pg";

/** The group role that holds the app's grants; migrations grant to it by name. */
export const APP_ROLE = "opsell_app";

export interface BootstrapUrls {
  ownerUrl: string;
  apiUrl: string;
  workerUrl: string;
}

interface Login {
  user: string;
  password: string;
  database: string;
}

function parseLogin(url: string): Login {
  const parsed = new URL(url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!parsed.username || !database) throw new Error(`Connection URL needs a user and a database`);
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
  };
}

async function withAdmin<T>(adminUrl: string, fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function ensureRole(
  client: pg.Client,
  name: string,
  attributes: string,
  password?: string,
): Promise<void> {
  const exists = await client.query("select 1 from pg_roles where rolname = $1", [name]);
  const verb = exists.rowCount ? "alter" : "create";
  const pw = password === undefined ? "" : ` password ${client.escapeLiteral(password)}`;
  await client.query(`${verb} role ${client.escapeIdentifier(name)} ${attributes}${pw}`);
}

/**
 * Creates the roles and the database named by the connection URLs, idempotently: the owner role
 * that runs migrations, and API and worker login roles in a group role without BYPASSRLS.
 * Needs a superuser connection; used by `pnpm dev`, CI and the test harness.
 */
export async function bootstrap(adminUrl: string, urls: BootstrapUrls): Promise<void> {
  const owner = parseLogin(urls.ownerUrl);
  const logins = [parseLogin(urls.apiUrl), parseLogin(urls.workerUrl)];
  await withAdmin(adminUrl, async (client) => {
    // Several test runs may bootstrap the same server at once.
    await client.query("select pg_advisory_lock(hashtext('opsell.bootstrap'))");
    try {
      await ensureRole(client, owner.user, "login nosuperuser nobypassrls", owner.password);
      await ensureRole(client, APP_ROLE, "nologin nosuperuser nobypassrls");
      for (const login of logins) {
        await ensureRole(client, login.user, "login nosuperuser nobypassrls", login.password);
        await client.query(
          `grant ${client.escapeIdentifier(APP_ROLE)} to ${client.escapeIdentifier(login.user)}`,
        );
      }
      await createDatabase(client, owner.database, owner.user);
    } finally {
      await client.query("select pg_advisory_unlock(hashtext('opsell.bootstrap'))");
    }
  });
}

async function createDatabase(
  client: pg.Client,
  name: string,
  owner: string,
  template?: string,
): Promise<void> {
  const exists = await client.query("select 1 from pg_database where datname = $1", [name]);
  if (exists.rowCount) return;
  const from = template ? ` template ${client.escapeIdentifier(template)}` : "";
  await client.query(
    `create database ${client.escapeIdentifier(name)} owner ${client.escapeIdentifier(owner)}${from}`,
  );
}

/** Creates `name` as a copy of `template`, owned by `owner`, unless it exists. */
export async function cloneDatabase(
  adminUrl: string,
  template: string,
  name: string,
  owner: string,
): Promise<void> {
  await withAdmin(adminUrl, async (client) => {
    // Postgres refuses to copy a template that another CREATE DATABASE is copying.
    await client.query("select pg_advisory_lock(hashtext($1))", [template]);
    try {
      await createDatabase(client, name, owner, template);
    } finally {
      await client.query("select pg_advisory_unlock(hashtext($1))", [template]);
    }
  });
}

/** Creates an empty database owned by `owner`, unless it exists. */
export async function createEmptyDatabase(
  adminUrl: string,
  name: string,
  owner: string,
): Promise<void> {
  await withAdmin(adminUrl, (client) => createDatabase(client, name, owner));
}

export async function dropDatabases(adminUrl: string, names: string[]): Promise<void> {
  await withAdmin(adminUrl, async (client) => {
    for (const name of names) {
      await client.query(`drop database if exists ${client.escapeIdentifier(name)} with (force)`);
    }
  });
}

export async function listDatabases(adminUrl: string, prefix: string): Promise<string[]> {
  return withAdmin(adminUrl, async (client) => {
    const result = await client.query<{ datname: string }>(
      "select datname from pg_database where starts_with(datname, $1)",
      [prefix],
    );
    return result.rows.map((row) => row.datname);
  });
}

/** Returns `url` pointing at another database on the same server. */
export function withDatabase(url: string, database: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${encodeURIComponent(database)}`;
  return parsed.toString();
}
