import pino, { type LoggerOptions } from "pino";

const isProd = process.env.NODE_ENV === "production";

const options: LoggerOptions = {
  level: isProd ? "info" : "debug",
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
};

let logger = pino(options);

if (!isProd) {
  const transport = pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
      singleLine: false,
    },
  });

  logger = pino(options, transport);
}

export { logger };