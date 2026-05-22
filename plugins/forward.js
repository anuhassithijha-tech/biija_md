const { cmd } = require("../command");

cmd({
    pattern: "forward",
    alias: ["fw"],
    desc: "Forward replied media/text message",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {

    try {

        const jid = args[0];

        if (!jid) {
            return reply("❌ Example:\n.forward 9477xxxx@s.whatsapp.net");
        }

        // check reply
        const quoted = mek.message?.extendedTextMessage?.contextInfo;

        if (!quoted) {
            return reply("❌ Video/Image/Message එකකට reply කරන්න");
        }

        // REAL FORWARD
        await conn.copyNForward(
            jid,
            {
                key: {
                    remoteJid: mek.key.remoteJid,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                },
                message: quoted.quotedMessage
            },
            true
        );

        reply("✅ Forwarded successfully!");

    } catch (e) {
        console.log("[FORWARD ERROR]", e);
        reply("❌ Forward failed");
    }
});
