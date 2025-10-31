import {
   randomBytes,
} from "crypto"

import { generateKeyPair } from "./generate-key-pair";
import { signedKeyPair } from "./signed-key-pair";

export function initAuthCreds() {
   const identityKey = generateKeyPair();
   return {
      noiseKey: generateKeyPair(),
      pairingEphemeralKeyPair: generateKeyPair(),
      signedIdentityKey: identityKey,
      signedPreKey: signedKeyPair(identityKey, 1),
      registrationId: Uint16Array.from(randomBytes(2))[0]! & 16383,
      advSecretKey: randomBytes(32).toString("base64"),
      processedHistoryMessages: [] as any[],
      nextPreKeyId: 1,
      firstUnuploadedPreKeyId: 1,
      accountSyncCounter: 0,
      registered: false,
      accountSettings: {
         unarchiveChats: false,
      },
   };
}
