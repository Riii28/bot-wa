import { BotHandler } from "../handlers/bot-handler";
import { WelcomeHandler } from "./conversations/welcome";
import { MenuHandler } from "./commands/menu";
import { PingHandler } from "./commands/ping";
import { AboutHandler } from "./commands/about";
import { HelpHandler } from "./commands/help";
import { IQHandler } from "./commands/check-iq";
import { ScheduleHandler } from "./commands/schedule";

export function registry(handler: BotHandler) {
   handler.addMessage(new WelcomeHandler());
   handler.addMessage(new MenuHandler());
   handler.addMessage(new PingHandler());
   handler.addMessage(new AboutHandler());
   handler.addMessage(new HelpHandler());
   handler.addMessage(new IQHandler());
   handler.addMessage(new ScheduleHandler());
}
