import { WAMessage, WASocket } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

export class MenuHandler extends MessageHandler {
   key: (string | RegExp)[] = ["menu"];
   type: HandlerType = "command";

   public async response(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);
      const menuText = `
╔═══❖  *IRVAN_BOT*  ❖═══╗

─────────────────────
    *MENU UTAMA*
─────────────────────
•  !menu   →  Tampilkan daftar menu
•  !help   →  Bantuan penggunaan bot
•  !ping   →  Tes bot
•  !about  →  Tentang bot

─────────────────────
    *GAME*
─────────────────────

•  !cek-iq  →  Cek iq kamu

─────────────────────
   *SEKOLAH*
─────────────────────

•  !jadwal  →  Jadwal mapel XII.5 Hari ini dan Besok

Ketik salah satu perintah di atas
untuk menjalankan fitur yang tersedia.
`;

      await sock.sendMessage(info.chatJid, { text: menuText });
   }
}
