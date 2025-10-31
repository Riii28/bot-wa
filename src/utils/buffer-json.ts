export const BufferJSON = {
   replacer: (_: string, value: any) => {
      if (
         Buffer.isBuffer(value) ||
         value instanceof Uint8Array ||
         (value?.type === "Buffer")
      ) {
         const val = value?.data || value;
         return {
            type: "Buffer",
            data: Buffer.from(val).toString("base64"),
         };
      }
      return value;
   },
   reviver: (_: string, value: any) => {
      if (typeof value === "object" && value) {
         if (value.buffer === true || value.type === "Buffer") {
            const val = value.data || value.value;
            if (typeof val === "string") return Buffer.from(val, "base64");
            return Buffer.from(val || []);
         }
      }
      return value;
   },
};
