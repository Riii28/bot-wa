import { BotHandler } from "../handlers/bot-handler";
import { WelcomeHandler } from "./conversations/welcome";
import { MenuHandler } from "./features/menu";
import { PingHandler } from "./features/ping";
import { AboutHandler } from "./features/about";
import { HelpHandler } from "./features/help";
import { IQHandler } from "./features/check-iq";
import { ScheduleHandler } from "./features/schedule";

export function registry(handler: BotHandler) {
   handler.addMessage(new WelcomeHandler());
   handler.addMessage(new MenuHandler());
   handler.addMessage(new PingHandler());
   handler.addMessage(new AboutHandler());
   handler.addMessage(new HelpHandler());
   handler.addMessage(new IQHandler());
   handler.addMessage(new ScheduleHandler());
}
