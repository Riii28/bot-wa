import { WAMessage, WASocket } from "baileys";
import * as qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { DisconnectReason } from "baileys";
import { MessageHandler } from "./message-handler";
import { logger } from "../utils/logger";
import { Authentication } from "../core/bot";

export interface MsgInfo {
   chatJid: string;
   chatId: string | undefined;
   senderJid: string;
   senderId: string | undefined;
   isGroup: boolean;
   name: string | null;
   fromMe: boolean | null | undefined;
   text: string;
   originalMsg: WAMessage;
}

export class BotHandler {
   private messageHandlers: Set<MessageHandler> = new Set();

   public addMessage(handler: MessageHandler) {
      const exists = Array.from(this.messageHandlers).some(
         (h) =>
            h.type === handler.type && h.key.join(",") === handler.key.join(",")
      );
      if (!exists) this.messageHandlers.add(handler);
   }

   public bindEvents(
      sock: WASocket,
      auth: Authentication,
      restart: () => Promise<void>
   ) {
      sock.ev.on("connection.update", async (conn) => {
         const { connection, lastDisconnect, qr } = conn;

         if (qr) qrcode.generate(qr, { small: true });
         if (connection === "open") logger.info("Connected to WhatsApp");

         if (connection === "close" && lastDisconnect) {
            const error = lastDisconnect.error;
            if (error instanceof Boom) {
               const code = error.output.statusCode;
               if (code === DisconnectReason.loggedOut) {
                  logger.error("Session logged out");
                  return;
               }
               await restart();
            }
         }
      });

      sock.ev.on("creds.update", async () => {
         if (auth.saveCreds) await auth.saveCreds();
      });

      sock.ev.on("messages.upsert", async ({ messages, type }) => {
         if (type !== "notify") return;

         for (const msg of messages) {
            if (msg.key.fromMe || !msg.message) continue;

            const content =
               msg.message.conversation ||
               msg.message.extendedTextMessage?.text ||
               msg.message.imageMessage?.caption ||
               msg.message.videoMessage?.caption ||
               msg.message.documentMessage?.caption ||
               msg.message.buttonsResponseMessage?.selectedButtonId ||
               msg.message.listResponseMessage?.singleSelectReply
                  ?.selectedRowId;

            logger.info(`incoming message: ${content}`);

            if (!content) continue;

            const text = content.trim();

            const info = this.parseSenderInfo(msg, text);

            const handler = this.findHandler(text);
            if (handler) await handler.response(sock, msg, info);
         }
      });

      sock.ev.on("call", async (e) => {
         for (const call of e) {
            if (!call.from) continue;
            logger.info(`incoming call from: ${call.from}`);
            await sock.rejectCall(call.id, call.from);
         }
      });
   }

   private parseSenderInfo(msg: WAMessage, text: string): MsgInfo {
      const remoteJid = msg.key.remoteJid || "";
      const isGroup = remoteJid.endsWith("@g.us");
      const fromMe = msg.key.fromMe;
      const senderJid = isGroup ? msg.key?.participant ?? "" : remoteJid;

      const chatId = remoteJid.split("@")[0];
      const senderId = senderJid.split("@")[0];
      const name = msg.pushName || null;

      return {
         chatJid: remoteJid,
         chatId,
         senderJid,
         senderId,
         isGroup,
         name,
         fromMe,
         text,
         originalMsg: msg,
      };
   }

   private findHandler(message: string): MessageHandler | undefined {
      if (message.startsWith("!")) {
         const command = message.slice(1).trim().toLowerCase();
         return Array.from(this.messageHandlers).find(
            (m) =>
               m.type === "command" &&
               m.key.some((k) =>
                  k instanceof RegExp
                     ? k.test(command)
                     : k.toLowerCase() === command
               )
         );
      }

      return Array.from(this.messageHandlers).find(
         (m) =>
            m.type === "conversation" &&
            m.key.some((k) =>
               k instanceof RegExp
                  ? k.test(message)
                  : message.toLowerCase().includes(k.toLowerCase())
            )
      );
   }
}
