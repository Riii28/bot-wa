import makeWASocket, {
   Browsers,
   makeCacheableSignalKeyStore,
   type WAVersion,
   type WASocket,
   type SignalDataTypeMap,
   type AuthenticationCreds,
} from "baileys";
import { Auth } from "./auth";
import { BotHandler } from "../handlers/bot-handler";
import { logger } from "../utils/logger";

export interface Version {
   isLatest: boolean;
   version: WAVersion;
}

export interface BotConfig {
   version: Version;
   auth: Auth;
}

export interface Key {
   get: <T extends keyof SignalDataTypeMap>(
      type: T,
      ids: string[],
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
   private readonly auth: Auth;
   private readonly version: Version;

   private handler: BotHandler | null = null;

   private isRestarting = false;
   private isListening = false;

   constructor({ version, auth }: BotConfig) {
      this.version = version;
      this.auth = auth;
   }

   public setHandler(handler: BotHandler) {
      this.handler = handler;
   }

   public async start() {
      const { state, saveCreds } = await this.auth.useAuthState();

      if (!this.version.isLatest) {
         logger.warn("Baileys version is not the latest");
      }

      const authentication: Authentication = {
         creds: state.creds,
         keys: state.keys,
         saveCreds,
      };

      this.sock = makeWASocket({
         version: this.version.version,
         auth: {
            creds: authentication.creds,
            keys: makeCacheableSignalKeyStore(authentication.keys),
         },
         logger,
         browser: Browsers.ubuntu("irvan_bot"),
      });

      this.listen(authentication);
   }

   private async handleLogout() {
      logger.info("Removing stored authentication...");

      const { removeCreds } = await this.auth.useAuthState();

      await removeCreds();

      logger.info("Authentication removed");

      await this.restart();
   }

   public async stop() {
      if (!this.sock) return;

      this.removeAllListeners();

      try {
         this.sock.end(undefined);
         await this.sock.ws.close();
      } catch (err) {
         logger.warn("Socket already closed");
      }

      this.sock = null;
      this.isListening = false;
   }

   private listen(authentication: Authentication) {
      if (this.isListening || !this.sock || !this.handler) {
         return;
      }

      this.isListening = true;

      this.handler.bindEvents(
         this.sock,
         authentication,
         () => this.restart(),
         () => this.handleLogout(),
      );
   }

   private removeAllListeners() {
      if (!this.sock) return;

      const ev = this.sock.ev;

      ev.removeAllListeners("connection.update");
      ev.removeAllListeners("messages.upsert");
      ev.removeAllListeners("creds.update");
      ev.removeAllListeners("call");
   }

   private async restart() {
      if (this.isRestarting) {
         logger.warn("Restart already in progress");
         return;
      }

      this.isRestarting = true;

      try {
         logger.info("Restarting bot in 3 seconds...");

         await this.stop();

         await this.delay(3000);

         await this.start();
      } catch (err) {
         logger.error(
            err instanceof Error ? err.message : "Failed to restart bot",
         );
      } finally {
         this.isRestarting = false;
      }
   }

   private delay(ms: number) {
      return new Promise((resolve) => {
         setTimeout(resolve, ms);
      });
   }
}
