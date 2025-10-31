import type { SignalDataTypeMap } from "baileys";
import { initAuthCreds } from "../utils/init-auth-creds";
import { BufferJSON } from "../utils/buffer-json";
import { Database } from "../database/pool";
import { fromObject } from "../utils/from-object";

export interface AuthOptions {
   session?: string;
   tableName?: string;
   retryDelayMs?: number;
   maxRetries?: number;
}

export class Auth {
   private table: string;
   private session: string;
   private retryDelay: number;
   private maxRetries: number;

   constructor(options: AuthOptions = {}) {
      this.table = options.tableName || "auth";
      this.session = options.session || "default";
      this.retryDelay = options.retryDelayMs || 200;
      this.maxRetries = options.maxRetries || 10;
   }

   async init() {
      await Database.query(`
         CREATE TABLE IF NOT EXISTS \`${this.table}\` (
            session VARCHAR(50) NOT NULL,
            id VARCHAR(80) NOT NULL,
            value LONGTEXT DEFAULT NULL,
            UNIQUE KEY idxunique (session,id),
            KEY idxsession (session),
            KEY idxid (id)
         ) ENGINE=MyISAM;
      `);
   }

   private async query<T = any>(sql: string, values?: any[]): Promise<T[]> {
      for (let i = 0; i < this.maxRetries; i++) {
         try {
            return await Database.query<T>(sql, values);
         } catch (err) {
            if (i === this.maxRetries - 1) throw err;
            await new Promise((r) => setTimeout(r, this.retryDelay));
         }
      }
      return [];
   }

   private async readData(id: string): Promise<any | null> {
      const rows = await this.query<{ value: string }>(
         `SELECT value FROM ${this.table} WHERE id = ? AND session = ?`,
         [id, this.session]
      );
      const value = rows[0]?.value;
      if (!value) return null;
      const raw = typeof value === "object" ? JSON.stringify(value) : value;
      return JSON.parse(raw, BufferJSON.reviver);
   }

   private async writeData(id: string, value: any) {
      const json =
         typeof value === "object"
            ? JSON.stringify(value, BufferJSON.replacer)
            : value;
      await this.query(
         `INSERT INTO ${this.table} (session, id, value)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE value = VALUES(value)`,
         [this.session, id, json]
      );
   }

   private async removeData(id: string) {
      await this.query(
         `DELETE FROM ${this.table} WHERE id = ? AND session = ?`,
         [id, this.session]
      );
   }

   private async clearAll() {
      await this.query(
         `DELETE FROM ${this.table} WHERE id != 'creds' AND session = ?`,
         [this.session]
      );
   }

   private async removeAll() {
      await this.query(`DELETE FROM ${this.table} WHERE session = ?`, [
         this.session,
      ]);
   }

   async useAuthState() {
      await this.init();
      const creds = (await this.readData("creds")) || initAuthCreds();

      return {
         state: {
            creds,
            keys: {
               get: async <T extends keyof SignalDataTypeMap>(
                  type: T,
                  ids: string[]
               ) => {
                  const data: { [id: string]: SignalDataTypeMap[T] } = {};
                  for (const id of ids) {
                     let value = await this.readData(`${type}-${id}`);
                     if (type === "app-state-sync-key" && value)
                        value = fromObject(value);
                     data[id] = value;
                  }
                  return data;
               },
               set: async (data: any) => {
                  for (const category in data) {
                     for (const id in data[category]) {
                        const value = data[category][id];
                        const key = `${category}-${id}`;
                        if (value) await this.writeData(key, value);
                        else await this.removeData(key);
                     }
                  }
               },
            },
         },
         saveCreds: async () => await this.writeData("creds", creds),
         clear: async () => await this.clearAll(),
         removeCreds: async () => await this.removeAll(),
      };
   }
}
