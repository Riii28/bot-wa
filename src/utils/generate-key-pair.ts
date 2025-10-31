import * as curve from "curve25519-js";
import {
   generateKeyPairSync,
   randomBytes,
} from "crypto";

export interface KeyPair {
   public: Buffer;
   private: Buffer;
}

export function generateKeyPair(): KeyPair {
   try {
      const { publicKey, privateKey } = generateKeyPairSync("x25519");

      const pubBuffer = Buffer.from(
         publicKey.export({ format: "der", type: "spki" })
      );
      const privBuffer = Buffer.from(
         privateKey.export({ format: "der", type: "pkcs8" })
      );

      return {
         public: pubBuffer.subarray(12, 44),
         private: privBuffer.subarray(16, 48),
      };
   } catch {
      const keyPair = curve.generateKeyPair(randomBytes(32));
      return {
         public: Buffer.from(keyPair.public),
         private: Buffer.from(keyPair.private),
      };
   }
}