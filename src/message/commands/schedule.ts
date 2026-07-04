import { WASocket, WAMessage } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";

interface ScheduleEntry {
   hour: string;
   subject: string | null;
}

interface Schedule {
   day: number;
   schedules: ScheduleEntry[];
}

const SCHEDULES: Schedule[] = [
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
   key = ["jadwal"];
   type: HandlerType = "command";

   public async response(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      const today = new Date().getDay();
      const todayFixed = this.normalizeDay(today);
      const tomorrowFixed = this.normalizeDay(today + 1);

      const todaySchedule = this.findSchedule(todayFixed);
      const tomorrowSchedule = this.findSchedule(tomorrowFixed);

      const text = this.formatResponse(
         todayFixed,
         todaySchedule,
         tomorrowFixed,
         tomorrowSchedule
      );

      await sock.sendMessage(info.chatJid, { text });
   }

   private normalizeDay(day: number): number {
      return day % 7;
   }

   private findSchedule(day: number): Schedule | undefined {
      return SCHEDULES.find((s) => s.day === day);
   }

   private formatSchedule(schedule?: Schedule): string {
      if (!schedule || schedule.schedules.length === 0)
         return "Tidak ada pelajaran (libur)";

      return schedule.schedules
         .map((s, i) => {
            const subject = s.subject ?? "Istirahat";
            return `${i + 1}. ${s.hour} → ${subject}`;
         })
         .join("\n");
   }

   private getDayString(day: number): string {
      const days = [
         "Minggu",
         "Senin",
         "Selasa",
         "Rabu",
         "Kamis",
         "Jumat",
         "Sabtu",
      ];
      return days[day] ?? "Tidak diketahui";
   }

   private formatResponse(
      today: number,
      todaySchedule: Schedule | undefined,
      tomorrow: number,
      tomorrowSchedule: Schedule | undefined
   ): string {
      const todayStr = this.getDayString(today);
      const tomorrowStr = this.getDayString(tomorrow);

      return [
         "╔═══❖  *IRVAN_BOT*  ❖═══╗",
         "",
         "📘 *JADWAL MATA PELAJARAN XII.5*",
         "─────────────────────────────",
         "",
         `🗓 *Hari ini* — ${todayStr}`,
         this.formatSchedule(todaySchedule),
         "",
         `🗓 *Besok* — ${tomorrowStr}`,
         this.formatSchedule(tomorrowSchedule),
         "",
         "─────────────────────────────",
         "_Gunakan perintah !jadwal untuk melihat kembali._",
      ].join("\n");
   }
}


