export function generateSignalPubKey(pubKey: Buffer): Buffer {
   return pubKey.length === 33 ? pubKey : Buffer.concat([Buffer.from([5]), pubKey]);
}
