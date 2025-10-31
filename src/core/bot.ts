import makeWASocket, {
   Browsers,
   makeCacheableSignalKeyStore,
   type WAVersion,
   type WASocket,
} from "baileys";
import { Auth } from "./auth";
import { BotHandler } from "../handlers/bot-handler";
import { logger } from "../utils/logger";

interface Version {
   isLatest: boolean;
   version: WAVersion;
}

interface BotConfig {
   authentication: Auth;
   version: Version;
}

export class Bot {
   private sock: WASocket | null = null;
   private authentication: Auth;
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
      if (!this.authentication.state?.creds) {
         logger.error("Authentication credentials not found");
         return;
      }

      if (!this.version.isLatest) {
         logger.warn("Baileys version is not the latest");
      }

      this.sock = makeWASocket({
         version: this.version.version,
         auth: {
            creds: this.authentication.state.creds,
            keys: makeCacheableSignalKeyStore(this.authentication.state.keys),
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
