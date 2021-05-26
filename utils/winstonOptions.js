const winston = require('winston');
const path = require('path');

const datetime = new Date();

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__dirname, `../log/server-status/info/${datetime.toISOString().slice(0,10)}.log`) }),
        new winston.transports.File({ filename: path.join(__dirname, `../log/server-status/error/${datetime.toISOString().slice(0,10)}.log`), level: 'error' })
    ]
});


module.exports = {
    logger
};