import { WAMessage, WASocket } from "baileys";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";
import { MsgInfo } from "../../handlers/bot-handler";

export class WelcomeHandler extends MessageHandler {
   key: string[] = ["hai", "halo", "hi"];
   type: HandlerType = "conversation";

   public async response(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      await sock.sendMessage(
         info.chatJid,
         { text: `Halo ${info.senderId}` },
         { quoted: msg }
      );
   }
}
