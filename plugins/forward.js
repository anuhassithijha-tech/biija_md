const { cmd } = require("../command");

const {
    generateForwardMessageContent,
    generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

cmd({
    pattern: "forward",
    alias: ["fw"],
    desc: "Real WhatsApp style forward",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {

    try {

        const jid = args[0];

        if (!jid) {
            return reply("❌ Example:\n.forward 94771234567@s.whatsapp.net");
        }

        // Reply check
        const quoted = mek.message?.extendedTextMessage?.contextInfo;

        if (!quoted || !quoted.quotedMessage) {
            return reply("❌ Message එකකට reply කරන්න");
        }

        // Build original message
        const message = {
            key: {
                remoteJid: mek.key.remoteJid,
                fromMe: false,
                id: quoted.stanzaId,
                participant: quoted.participant
            },
            message: quoted.quotedMessage
        };

        // Generate forward content
        const content = await generateForwardMessageContent(
            message,
            false
        );

        // Create WA message
        const waMessage = generateWAMessageFromContent(
            jid,
            content,
            {}
        );

        // Send
        await conn.relayMessage(
            jid,
            waMessage.message,
            {
                messageId: waMessage.key.id
            }
        );

        reply("✅ Forwarded Successfully!");

    } catch (e) {
        console.log("[FORWARD ERROR]", e);
        reply("❌ Forward Failed");
    }
});
