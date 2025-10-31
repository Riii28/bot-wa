export function allocate(str: string): Uint8Array {
   let p = str.length;
   if (!p) return new Uint8Array(1);

   let n = 0;
   while (--p % 4 > 1 && str.charAt(p) === "=") ++n;

   return new Uint8Array(Math.ceil((str.length * 3) / 4) - n).fill(0);
}