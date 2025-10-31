import * as curve from "curve25519-js";

export function calculateSignature(privKey: Buffer, message: Buffer): Buffer {
   return Buffer.from(curve.sign(privKey, message, undefined));
}
