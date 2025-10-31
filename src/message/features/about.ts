import { WASocket, WAMessage } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

export class AboutHandler extends MessageHandler {
   key: (string | RegExp)[] = ["about"];
   type: HandlerType = "command";

   public async answer(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      const text = `
╔═══❖  *IRVAN_BOT*  ❖═══╗
        
Bot ilegal nan dalam pengembangan :)

Owner: https://www.instagram.com/hy.rii28
`;

      await sock.sendMessage(info.chatJid, { text });
   }
}
