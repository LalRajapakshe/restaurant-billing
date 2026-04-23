import type { Request as SqlRequest, Transaction } from "mssql";

import { getDbPool, sql } from "@/lib/db";

export type SqlParam = {
  name: string;
  value: unknown;
  type?: unknown;
};

function bindParams(request: SqlRequest, params: SqlParam[] = []) {
  for (const param of params) {
    const value = param.value === undefined ? null : param.value;

    if (param.type) {
      request.input(param.name, param.type as never, value as never);
    } else {
      request.input(param.name, value as never);
    }
  }

  return request;
}

export async function executeProcedure<T = Record<string, unknown>>(
  procedureName: string,
  params: SqlParam[] = []
) {
  const pool = await getDbPool();
  const request = bindParams(pool.request(), params);
  return request.execute<T>(procedureName);
}

export async function queryRows<T = Record<string, unknown>>(
  queryText: string,
  params: SqlParam[] = []
) {
  const pool = await getDbPool();
  const request = bindParams(pool.request(), params);
  const result = await request.query<T>(queryText);
  return result.recordset;
}

export async function withTransaction<T>(
  work: (transaction: Transaction) => Promise<T>
) {
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function executeProcedureInTransaction<T = Record<string, unknown>>(
  transaction: Transaction,
  procedureName: string,
  params: SqlParam[] = []
) {
  const request = bindParams(new sql.Request(transaction), params);
  return request.execute<T>(procedureName);
}

export { sql };
