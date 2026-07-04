import dotenv from "dotenv";
import { Auth } from "./core/auth";
import { Bot } from "./core/bot";
import { BotHandler } from "./handlers/bot-handler";
import { fetchLatestBaileysVersion } from "baileys";
import { logger } from "./utils/logger";
import { registry } from "./message/registry";
import { MessageHandler } from "./handlers/message-handler";

dotenv.config({ quiet: true });

const main = async () => {
   try {
      console.clear();
      logger.info("Starting WhatsApp Bot...");

      const version = await fetchLatestBaileysVersion();
      logger.info(
         `Baileys version: ${version.version.join(".")} ${version.isLatest ? "(latest)" : ""}`,
      );

      logger.info("Loading authentication state...");
      const auth = new Auth({ tableName: "auth", session: "default_session" });
      const { state, saveCreds } = await auth.useAuthState();
      logger.info("Auth state loaded");

      const bot = new Bot({
         authentication: { creds: state.creds, keys: state.keys, saveCreds },
         version,
      });

      const handler = new BotHandler();

      logger.info(`Loading ${MessageHandler.name}...`);
      registry(handler);
      bot.setHandler(handler);
      logger.info("Message handler registered");

      logger.info("Connecting to WhatsApp...");
      bot.start();

      process.on("SIGINT", async () => {
         logger.info("Bot is shutting down gracefully. Bye!");
         await bot.stop();
         process.exit(0);
      });

      process.on("SIGTERM", async () => {
         logger.info("Bot is shutting down gracefully. Bye!");
         await bot.stop();
         process.exit(0);
      });
   } catch (err) {
      if (err instanceof Error) {
         logger.error(err.message);
      }
   }
};

main();
