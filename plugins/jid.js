const { cmd } = require("../command");

cmd({
    pattern: "jid",
    desc: "Get real jid",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply }) => {

    let jid;

    // Reply message user real jid
    if (m.quoted) {
        jid = m.quoted.sender;
    }

    // Group real jid
    else if (m.isGroup) {
        jid = m.chat;
    }

    // Private chat real jid
    else {
        jid = m.sender;
    }

    // Remove LID if exists
    jid = jid.replace(/@lid/g, "@s.whatsapp.net");

    return reply(jid);
});
