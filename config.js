const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "tUkXiYoQ#_wHf8UlwsnvJqxEzZR5k8AG0om54_suro6VFfkRJ0IM",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/sithija-bot/SITHIJA_MD/blob/main/alive.png1.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*⚡ SITHIJA MD Alive❤️ Fast & Active Always*",
BOT_OWNER: '94785936039',  // Replace with the owner's phone number



};
