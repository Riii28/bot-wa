import { allocate } from "./allocate";
import { parseTimestamp } from "./parse-timestamp";

export function fromObject(args: any) {
   const f = {
      ...args.fingerprint,
      deviceIndexes: Array.isArray(args.fingerprint.deviceIndexes)
         ? args.fingerprint.deviceIndexes
         : [],
   };

   const message = {
      keyData: Array.isArray(args.keyData) ? args.keyData : new Uint8Array(),
      fingerprint: {
         rawId: f.rawId || 0,
         currentIndex: f.currentIndex || 0,
         deviceIndexes: f.deviceIndexes,
      },
      timestamp: parseTimestamp(args.timestamp),
   };

   if (typeof args.keyData === "string") {
      message.keyData = allocate(args.keyData);
   }

   return message;
}

