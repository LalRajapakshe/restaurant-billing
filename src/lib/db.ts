import sql from "mssql";

type GlobalSqlCache = typeof globalThis & {
  __hotelSqlPoolPromise?: Promise<sql.ConnectionPool>;
};

function boolEnv(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function numberEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getConfig(): sql.config {
  const server = process.env.DB_SERVER;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const instanceName = process.env.DB_INSTANCE;

  if (!server || !database || !user || !password) {
    throw new Error(
      "Database environment variables are missing. Required: DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD."
    );
  }

  return {
    server,
    database,
    user,
    password,
    port: numberEnv("DB_PORT", 1433),
    options: {
      encrypt: boolEnv("DB_ENCRYPT", false),
      trustServerCertificate: boolEnv("DB_TRUST_SERVER_CERT", true),
      instanceName: instanceName || undefined,
    },
    pool: {
      max: numberEnv("DB_POOL_MAX", 10),
      min: numberEnv("DB_POOL_MIN", 0),
      idleTimeoutMillis: numberEnv("DB_POOL_IDLE_TIMEOUT_MS", 30000),
    },
  };
}

export async function getDbPool() {
  const globalCache = globalThis as GlobalSqlCache;

  if (!globalCache.__hotelSqlPoolPromise) {
    globalCache.__hotelSqlPoolPromise = new sql.ConnectionPool(getConfig()).connect();
  }

  return globalCache.__hotelSqlPoolPromise;
}

export { sql };
