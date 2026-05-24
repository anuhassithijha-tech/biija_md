const { cmd } = require("../command");

cmd({
    pattern: "jid",
    desc: "Get JID",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply }) => {

    let jid;

    // Reply user
    if (m.quoted) {
        jid =
            m.quoted.sender ||
            m.quoted.participant ||
            m.quoted.chat;
    }

    // Group
    else if (m.isGroup) {
        jid = m.chat;
    }

    // Private
    else {
        jid = m.sender;
    }

    return reply(jid);
});
