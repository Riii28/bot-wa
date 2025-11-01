import { createPool, Pool } from "mysql2/promise";

export class Database {
   private static instance: Pool;

   static get pool(): Pool {
      if (!Database.instance) {
         Database.instance = createPool({
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "wa_auth_db",
            connectionLimit: 5,
            waitForConnections: true,
            enableKeepAlive: true,
         });
      }
      return Database.instance;
   }

   static async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
      const [rows] = await Database.pool.query(sql, params);
      return rows as T[];
   }
}
