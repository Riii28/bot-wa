import { WAMessage, WASocket } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

const iqRanges = [
   { min: 0, max: 10, desc: "Lebih pintar Simpanse sih" },
   { min: 11, max: 25, desc: "11 12 Sama Simpanse" },
   {
      min: 26,
      max: 40,
      desc: "Sedikit diatas Simpanse",
   },
   { min: 41, max: 55, desc: "IQ Manusia pra-sejarah" },
   { min: 56, max: 70, desc: "Rata rata pengguna TikTok." },
   {
      min: 71,
      max: 85,
      desc: "Sedikit di bawah rata-rata, tapi lucunya dapet.",
   },
   { min: 86, max: 100, desc: "Rata-rata" },
   { min: 101, max: 115, desc: "Cerdas, tetap pertahankan!" },
   { min: 116, max: 130, desc: "Di atas rata-rata banget!" },
   {
      min: 131,
      max: 145,
      desc: "Jenius level wizard, tapi suka overthinking.",
   },
   { min: 146, max: 160, desc: "Otaknya multi-core." },
   {
      min: 161,
      max: 180,
      desc: "IQ tinggi banget, Albert Enstein kalah bro",
   },
   {
      min: 181,
      max: 200,
      desc: "Alien",
   },
];

export class IQHandler extends MessageHandler {
   key = ["iq", "cek-iq"];
   type: HandlerType = "command";

   public async response(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      if (!msg.key.remoteJid) return;

      await sock.readMessages([msg.key]);

      const iq = Math.floor(Math.random() * 121) + 60;
      const range = iqRanges.find((r) => iq >= r.min && iq <= r.max);
      const desc = range ? range.desc : "Tidak terdeteksi";

      const result = `
╔═══❖  *IRVAN_BOT*  ❖═══╗


IQ kamu: *${iq}*
Deskripsi: ${desc}
`;

      await sock.sendMessage(info.chatJid, { text: result }, { quoted: msg });
   }
}
