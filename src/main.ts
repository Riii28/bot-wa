import dotenv from "dotenv";
import { Auth } from "./core/auth";
import { Bot } from "./core/bot";
import { BotHandler } from "./handlers/bot-handler";
import { fetchLatestBaileysVersion } from "baileys";
import { logger } from "./utils/logger";
import { WelcomeHandler } from "./message/conversations/welcome";
import { MenuHandler } from "./message/features/menu";
import { PingHandler } from "./message/features/ping";
import { AboutHandler } from "./message/features/about";
import { HelpHandler } from "./message/features/help";
import { IQHandler } from "./message/features/check-iq";
import { ScheduleHandler } from "./message/features/schedule";

dotenv.config();

const main = async () => {
   try {
      const version = await fetchLatestBaileysVersion();

      const auth = new Auth({ tableName: "auth", session: "default_session" });
      const { state, saveCreds } = await auth.useAuthState();

      const bot = new Bot({
         authentication: { creds: state.creds, keys: state.keys, saveCreds },
         version,
      });

      const handler = new BotHandler();

      handler.addMessage(new WelcomeHandler());
      handler.addMessage(new MenuHandler());
      handler.addMessage(new PingHandler());
      handler.addMessage(new AboutHandler());
      handler.addMessage(new HelpHandler());
      handler.addMessage(new IQHandler());
      handler.addMessage(new ScheduleHandler());

      bot.setHandler(handler);
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
