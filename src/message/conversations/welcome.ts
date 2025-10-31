import { WAMessage, WASocket } from "baileys";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";
import { MsgInfo } from "../../handlers/bot-handler";

export class WelcomeHandler extends MessageHandler {
   key: string[] = ["hai", "halo"];
   type: HandlerType = "conversation";

   public async answer(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      if (msg.key.remoteJid) {
         await sock.readMessages([msg.key]);

         if (info.senderId === "6282180761646") {
            await sock.sendMessage(
               msg.key.remoteJid,
               { text: `Hai juga sayang` },
               { quoted: msg }
            );
            return;
         }

         await sock.sendMessage(
            msg.key.remoteJid,
            { text: `Halo ${info.senderId}` },
            { quoted: msg }
         );
      }
   }
}
