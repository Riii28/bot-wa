import { WASocket, WAMessage } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

export class HelpHandler extends MessageHandler {
   key: (string | RegExp)[] = ["help", "h"];
   type: HandlerType = "command";

   public async answer(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      const text = `
╔═══❖  *IRVAN_BOT*  ❖═══╗

Gunakan awalan (!) untuk mengakses menu        
Contoh: !ping
`;

      await sock.sendMessage(info.chatJid, { text });
   }
}
