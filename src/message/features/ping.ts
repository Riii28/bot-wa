import { WASocket, WAMessage } from "baileys";
import { MsgInfo } from "../../handlers/bot-handler";
import os from "os";
import { HandlerType, MessageHandler } from "../../handlers/message-handler";
import { Database } from "../../database/pool";

export class PingHandler extends MessageHandler {
   key: (string | RegExp)[] = ["ping", "tes", "test"];
   type: HandlerType = "command";

   public async answer(
      sock: WASocket,
      msg: WAMessage,
      info: MsgInfo
   ): Promise<void> {
      await sock.readMessages([msg.key]);

      const mem = process.memoryUsage();
      const uptime = this.formatUptime(process.uptime());

      const q = await Database.query("select * from auth");

      let value: any = null;

      q.forEach((s) => {
         value += s;
      });

      const text = ` 
╔═══❖  *IRVAN_BOT*  ❖═══╗

It's work!

hasil:
${value}
        
Running on: ${os.type()}
Uptime: ${uptime}

Device Memory: ${this.toGB(os.totalmem())}
Available Memory: ${this.toGB(os.freemem())}

Memory usage: 
   • Total Memory (RSS)        : ${this.toMB(mem.rss)}
   • Allocated Memory (Heap)   : ${this.toMB(mem.heapTotal)}
   • Used Memory (Heap)        : ${this.toMB(mem.heapUsed)}
   • External Memory           : ${this.toMB(mem.external)}
   • Array Buffers             : ${this.toMB(mem.arrayBuffers)}
`;

      await sock.sendMessage(info.chatJid, { text });
   }

   private formatUptime(seconds: number) {
      const totalSeconds = Math.floor(seconds);

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      const pad = (num: number) => String(num).padStart(2, "0");

      return `${pad(h)}:${pad(m)}:${pad(s)}`;
   }

   private toGB(bytes: number) {
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
   }

   private toMB(bytes: number) {
      return (bytes / 1024 / 1024).toFixed(2) + " MB";
   }
}
