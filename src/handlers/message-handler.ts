import { WAMessage, WASocket, delay } from "baileys";
import { MsgInfo } from "./bot-handler";

export type HandlerType = "conversation" | "command";

export abstract class MessageHandler {
   abstract key: (string | RegExp)[];
   abstract type: HandlerType;
   
   abstract response(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void>;

   protected async typeEffect(sock: WASocket, jid: string) {
      await sock.presenceSubscribe(jid);
      await delay(500);

      await sock.sendPresenceUpdate("composing", jid);
      await delay(2000);

      await sock.sendPresenceUpdate("paused", jid);
   }
}
