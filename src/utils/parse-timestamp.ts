export function parseTimestamp(timestamp: string | number): number {
   if (typeof timestamp === "string") return parseInt(timestamp, 10);
   if (typeof timestamp === "number") return timestamp;
   return 0;
}
