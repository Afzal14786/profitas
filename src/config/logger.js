import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino(
  {
    level: isProduction ? "info" : "debug",

    timestamp: pino.stdTimeFunctions.isoTime,

    base: {
      service: "profitas-api",
    },
  },

  pino.multistream([
    {
      stream: process.stdout,
      level: "debug",
    },
    {
      stream: pino.destination({
        dest: "./logs/app.log",
        mkdir: true,
        sync: false,
      }),
      level: "debug",
    },
    {
      stream: pino.destination({
        dest: "./logs/error.log",
        mkdir: true,
        sync: false,
      }),
      level: "error",
    },
  ])
);