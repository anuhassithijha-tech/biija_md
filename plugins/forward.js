const { cmd } = require("../command");

cmd({
    pattern: "forward",
    alias: ["fw"],
    desc: "Forward replied message to jid",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {

    try {

        // JID
        const jid = args[0];

        if (!jid) {
            return reply("❌ Example:\n.forward 94771234567@s.whatsapp.net");
        }

        // Reply check
        const contextInfo =
            mek.message?.extendedTextMessage?.contextInfo;

        if (!contextInfo || !contextInfo.quotedMessage) {
            return reply("❌ Message එකකට reply කරන්න");
        }

        // Quoted message
        const quotedMessage = contextInfo.quotedMessage;

        // Forward exact message
        await conn.relayMessage(
            jid,
            quotedMessage,
            {
                messageId: contextInfo.stanzaId
            }
        );

        reply("✅ Message Forwarded!");

    } catch (e) {
        console.log(e);
        reply("❌ Forward Failed");
    }
});
