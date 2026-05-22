const { cmd } = require("../command");

cmd({
    pattern: "jid",
    alias: ["getjid"],
    desc: "Get sender JID",
    category: "tools",
    react: "🆔",
    filename: __filename
},
async (conn, mek, m, { reply, sender, from }) => {

    try {
        const jid = mek.key.participant || mek.key.remoteJid;

        await reply(`🆔 Your JID:\n\n${jid}`);

    } catch (e) {
        console.log(e);
        reply("❌ Error getting JID");
    }
});
