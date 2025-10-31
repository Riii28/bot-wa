import { generateSignalPubKey } from "./generate-signal-pubkey";
import { generateKeyPair, KeyPair } from "./generate-key-pair";
import { calculateSignature } from "./calculate-signature";

export function signedKeyPair(identityKeyPair: KeyPair, keyId: number) {
   const preKey = generateKeyPair();
   const pubKey = generateSignalPubKey(preKey.public);
   const signature = calculateSignature(identityKeyPair.private, pubKey);
   return { keyPair: preKey, signature, keyId };
}
