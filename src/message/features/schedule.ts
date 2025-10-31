import { WASocket, WAMessage } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

interface Schedule {
   day: number;
   schedules: {
      hour: string;
      subject: string | null;
   }[];
}

const schedule: Schedule[] = [
   {
      day: 1,
      schedules: [
         { hour: "07.00 - 07.45", subject: "Upacara / Kokurikuler" },
         { hour: "07.45 - 08.30", subject: "Olahrage" },
         { hour: "08.30 - 09.15", subject: "Olahrage" },
         { hour: "09.15 - 10.00", subject: "Matematika TL" },
         { hour: "10.00 - 10.15", subject: null },
         { hour: "10.15 - 11.00", subject: "PPKN" },
         { hour: "11.00 - 11.45", subject: "PPKN" },
         { hour: "11.45 - 12.30", subject: null },
         { hour: "12.30 - 13.15", subject: "Seni Budaya" },
         { hour: "13.15 - 14.00", subject: "Seni Budaya" },
         { hour: "14.00 - 14.45", subject: "Sejarah TL" },
         { hour: "14.45 - 15.30", subject: "Sejarah TL" },
      ],
   },
   {
      day: 2,
      schedules: [
         { hour: "07.00 - 07.45", subject: "Matematika" },
         { hour: "07.45 - 08.30", subject: "Matematika" },
         { hour: "08.30 - 09.15", subject: "Matematika" },
         { hour: "09.15 - 10.00", subject: "Matematika TL" },
         { hour: "10.00 - 10.15", subject: null },
         { hour: "10.15 - 11.00", subject: "Bhs Indonesia" },
         { hour: "11.00 - 11.45", subject: "Bhs Indonesia" },
         { hour: "11.45 - 12.30", subject: null },
         { hour: "12.30 - 13.15", subject: "Sejarah" },
         { hour: "13.15 - 14.00", subject: "Sejarah" },
         { hour: "14.00 - 14.45", subject: "Bhs Jawa" },
         { hour: "14.45 - 15.30", subject: "Bhs Jawa" },
      ],
   },
   {
      day: 3,
      schedules: [
         { hour: "07.00 - 07.45", subject: "Informatika" },
         { hour: "07.45 - 08.30", subject: "Informatika" },
         { hour: "08.30 - 09.15", subject: "Informatika" },
         { hour: "09.15 - 10.00", subject: "Matematika TL" },
         { hour: "10.00 - 10.15", subject: null },
         { hour: "10.15 - 11.00", subject: "Matematika TL" },
         { hour: "11.00 - 11.45", subject: "Matematika TL" },
         { hour: "11.45 - 12.30", subject: null },
         { hour: "12.30 - 13.15", subject: "Prakarya" },
         { hour: "13.15 - 14.00", subject: "Prakarya" },
         { hour: "14.00 - 14.45", subject: "Pendidikan Agama" },
         { hour: "14.45 - 15.30", subject: "Pendidikan Agama " },
      ],
   },
   {
      day: 4,
      schedules: [
         { hour: "07.00 - 07.45", subject: "Sejarah TL" },
         { hour: "07.45 - 08.30", subject: "Sejarah TL" },
         { hour: "08.30 - 09.15", subject: "Sejarah TL" },
         { hour: "09.15 - 10.00", subject: "Bhs Inggris" },
         { hour: "10.00 - 10.15", subject: null },
         { hour: "10.15 - 11.00", subject: "Bhs Inggris" },
         { hour: "11.00 - 11.45", subject: "Bhs Inggris" },
         { hour: "11.45 - 12.30", subject: null },
         { hour: "12.30 - 13.15", subject: "Informatika" },
         { hour: "13.15 - 14.00", subject: "Informatika" },
         { hour: "14.00 - 14.45", subject: "Fisika" },
         { hour: "14.45 - 15.30", subject: "Fisika" },
      ],
   },
   {
      day: 5,
      schedules: [
         { hour: "07.00 - 07.35", subject: "Wali Kelas" },
         { hour: "07.35 - 08.10", subject: "Wali Kelas" },
         { hour: "08.10 - 08.45", subject: "Wali Kelas" },
         { hour: "08.45 - 09.20", subject: "Bhs Indonesia" },
         { hour: "09.20 - 09.45", subject: null },
         { hour: "09.45 - 10.20", subject: "Fisika" },
         { hour: "10.20 - 10.55", subject: "Fisika" },
         { hour: "10.55 - 11.30", subject: "Fisika" },
      ],
   },
];

export class ScheduleHandler extends MessageHandler {
   key: (string | RegExp)[] = ["jadwal"];
   type: HandlerType = "command";

   public async answer(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      const today = new Date().getDay();

      let texts: string = "";

      const todaySchedule = this.getSchedule(today);
      const tomorrowSchedule = this.getSchedule(today + 1);

      const text = `
╔═══❖  *IRVAN_BOT*  ❖═══╗

─────────────────────
*JADWAL MATA PELAJARAN XII.5*

Hari ini:
${this.getDayStr(today)}

${this.formatSchedule(todaySchedule) || "Libur"}

Besok:
${this.getDayStr(today + 1)}

${this.formatSchedule(tomorrowSchedule) || "Libur"}
`;

      await sock.sendMessage(info.chatJid, { text });
   }

   private getSchedule(day: number) {
      return schedule.find((s) => s.day === day);
   }

   private formatSchedule(schedule: Schedule | undefined) {
      const s = schedule?.schedules.map(
         (s) =>
            `Jam ke: ${s.hour} - Mapel: ${
               s.subject === null ? "Istirahat" : s.subject
            }\n`
      );

      return s?.join(" ").split(", ");
   }

   private getDayStr(day: number | undefined): string {
      if (!day) return "Libur";

      switch (day) {
         case 0:
            return "Minggu";
         case 1:
            return "Senin";
         case 2:
            return "Selasa";
         case 3:
            return "Rabu";
         case 4:
            return "Kamis";
         case 5:
            return "Jum'at";
         case 6:
            return "Sabtu";
         default:
            throw new Error(`day ${day} not found`);
      }
   }
}
