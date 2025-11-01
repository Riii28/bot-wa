import makeWASocket, {
   Browsers,
   makeCacheableSignalKeyStore,
   type WAVersion,
   type WASocket,
   SignalDataTypeMap,
   AuthenticationCreds,
} from "baileys";
import { BotHandler } from "../handlers/bot-handler";
import { logger } from "../utils/logger";

export interface Version {
   isLatest: boolean;
   version: WAVersion;
}

export interface BotConfig {
   authentication: Authentication;
   version: Version;
}

export interface Key {
   get: <T extends keyof SignalDataTypeMap>(
      type: T,
      ids: string[]
   ) => Promise<{
      [id: string]: SignalDataTypeMap[T];
   }>;
   set: (data: any) => Promise<void>;
}

export interface Authentication {
   creds: AuthenticationCreds;
   keys: Key;
   saveCreds: () => Promise<void>;
}

export class Bot {
   private sock: WASocket | null = null;
   private authentication: Authentication;
   private version: Version;
   private handler: BotHandler | null = null;
   private isRestarting = false;
   private isListening = false;

   constructor({ authentication, version }: BotConfig) {
      this.authentication = authentication;
      this.version = version;
   }

   public setHandler(handler: BotHandler) {
      this.handler = handler;
   }

   public async start() {
      if (!this.authentication) {
         logger.error("Authentication credentials not found");
         return;
      }

      if (!this.version.isLatest) {
         logger.warn("Baileys version is not the latest");
      }

      this.sock = makeWASocket({
         version: this.version.version,
         auth: {
            creds: this.authentication.creds,
            keys: makeCacheableSignalKeyStore(this.authentication.keys),
         },
         browser: Browsers.ubuntu("irvan_bot"),
      });

      await this.listen();
   }

   public async stop() {
      if (!this.sock) return;
      this.removeAllListeners();

      this.sock.end(undefined);
      await this.sock.ws.close();

      this.sock = null;
      this.isListening = false;
   }

   private removeAllListeners() {
      if (!this.sock) return;
      const ev = this.sock.ev;
      ev.removeAllListeners("connection.update");
      ev.removeAllListeners("messages.upsert");
      ev.removeAllListeners("creds.update");
      ev.removeAllListeners("call");
   }

   private async listen() {
      if (this.isListening || !this.sock || !this.handler) return;
      this.isListening = true;

      this.handler.bindEvents(this.sock, this.authentication, () =>
         this.restart()
      );
   }

   private async restart() {
      if (this.isRestarting) return;
      this.isRestarting = true;

      logger.info("Reconnecting in 3 seconds...");
      await this.stop();

      setTimeout(async () => {
         await this.start();
         this.isRestarting = false;
      }, 3000);
   }
}
