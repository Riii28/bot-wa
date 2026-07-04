import { Boom } from "@hapi/boom";
import { DisconnectReason, WAMessage, WASocket } from "baileys";
import * as qrcode from "qrcode-terminal";

import { Authentication } from "../core/bot";
import { MessageHandler } from "./message-handler";
import { logger } from "../utils/logger";

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
   private readonly messageHandlers = new Set<MessageHandler>();

   public addMessage(handler: MessageHandler) {
      const exists = [...this.messageHandlers].some(
         (h) =>
            h.type === handler.type &&
            h.key.join(",") === handler.key.join(","),
      );

      if (exists) return;

      this.messageHandlers.add(handler);

      logger.info(
         `Added ${handler.key.join(", ")} ${MessageHandler.name} successfully`,
      );
   }

   public bindEvents(
      sock: WASocket,
      auth: Authentication,
      restart: () => Promise<void>,
      onLogout: () => Promise<void>,
   ) {
      sock.ev.on("connection.update", (update) =>
         this.handleConnectionUpdate(update, restart, onLogout),
      );

      sock.ev.on("creds.update", () => auth.saveCreds());

      sock.ev.on("messages.upsert", ({ messages, type }) =>
         this.handleMessages(sock, messages, type),
      );

      sock.ev.on("call", (calls) => this.handleCalls(sock, calls));
   }

   private async handleConnectionUpdate(
      update: any,
      restart: () => Promise<void>,
      onLogout: () => Promise<void>,
   ) {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
         logger.info("New QR code generated");
         qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
         logger.info("Connected to WhatsApp");
         return;
      }

      if (connection !== "close" || !lastDisconnect) {
         return;
      }

      const error = lastDisconnect.error;

      if (!(error instanceof Boom)) {
         logger.warn("Connection closed with unknown error");
         await restart();
         return;
      }

      const code = error.output.statusCode;

      if (code === DisconnectReason.loggedOut) {
         logger.error("Session logged out");

         await onLogout();

         return;
      }

      logger.warn(`Connection closed (code: ${code})`);
      logger.info("Attempting to reconnect...");

      await restart();
   }

   private async handleMessages(
      sock: WASocket,
      messages: WAMessage[],
      type: string,
   ) {
      if (type !== "notify") return;

      for (const msg of messages) {
         if (msg.key.fromMe || !msg.message) {
            continue;
         }

         const content = this.extractMessageContent(msg);

         if (!content) continue;

         logger.info(`Incoming message: ${content}`);

         const text = content.trim();
         const info = this.parseSenderInfo(msg, text);

         const handler = this.findHandler(text);

         if (handler) {
            await handler.response(sock, msg, info);
         }
      }
   }

   private async handleCalls(sock: WASocket, calls: any[]) {
      for (const call of calls) {
         if (!call.from) continue;

         logger.info(`Incoming call from: ${call.from}`);

         await sock.rejectCall(call.id, call.from);
      }
   }

   private extractMessageContent(msg: WAMessage) {
      return (
         msg.message?.conversation ||
         msg.message?.extendedTextMessage?.text ||
         msg.message?.imageMessage?.caption ||
         msg.message?.videoMessage?.caption ||
         msg.message?.documentMessage?.caption ||
         msg.message?.buttonsResponseMessage?.selectedButtonId ||
         msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId
      );
   }

   private parseSenderInfo(msg: WAMessage, text: string): MsgInfo {
      const remoteJid = msg.key.remoteJid ?? "";
      const isGroup = remoteJid.endsWith("@g.us");

      const senderJid = isGroup ? (msg.key.participant ?? "") : remoteJid;

      return {
         chatJid: remoteJid,
         chatId: remoteJid.split("@")[0],
         senderJid,
         senderId: senderJid.split("@")[0],
         isGroup,
         name: msg.pushName ?? null,
         fromMe: msg.key.fromMe,
         text,
         originalMsg: msg,
      };
   }

   private findHandler(message: string): MessageHandler | undefined {
      const handlers = [...this.messageHandlers];

      if (message.startsWith("!")) {
         const command = message.slice(1).trim().toLowerCase();

         return handlers.find(
            (handler) =>
               handler.type === "command" &&
               handler.key.some((key) =>
                  key instanceof RegExp
                     ? key.test(command)
                     : key.toLowerCase() === command,
               ),
         );
      }

      return handlers.find(
         (handler) =>
            handler.type === "conversation" &&
            handler.key.some((key) =>
               key instanceof RegExp
                  ? key.test(message)
                  : message.toLowerCase().includes(key.toLowerCase()),
            ),
      );
   }
}
