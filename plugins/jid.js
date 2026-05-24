const { cmd } = require("../command");

cmd({
    pattern: "jid",
    desc: "Get Real JID",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply }) => {

    // Group / User real JID
    let jid = m.chat;

    // Send real JID only
    return reply(jid);

});
