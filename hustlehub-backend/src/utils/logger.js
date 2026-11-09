const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const transports = [];

// 1. Always log to the local terminal with nice colors
transports.push(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    })
);

// 2. If the cloud token exists, stream logs to Better Stack
if (process.env.LOGTAIL_SOURCE_TOKEN) {
    const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
    transports.push(new LogtailTransport(logtail));
} else {
    console.warn('LOGTAIL_SOURCE_TOKEN missing: Cloud logging is disabled.');
}

// Create and export the Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Cloud platforms parse JSON automatically
    ),
    transports: transports,
});

module.exports = logger;