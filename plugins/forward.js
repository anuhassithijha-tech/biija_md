const { cmd } = require("../command");

cmd({
    pattern: "forward",
    alias: ["fw"],
    desc: "Forward any message (text/media/doc/video/image)",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {

    try {

        const jid = args[0];

        if (!jid) {
            return reply("❌ JID එක දෙන්න\n\nExample:\n.forward 9477xxxx@s.whatsapp.net");
        }

        if (!jid.includes("@")) {
            return reply("❌ Invalid JID format");
        }

        // must reply to a message
        const msg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!msg) {
            return reply("❌ Any message (text/image/video/doc) එකකට reply කරලා use කරන්න");
        }

        // REAL UNIVERSAL FORWARD
        await conn.sendMessage(jid, {
            forward: mek
        });

        reply("✅ Successfully forwarded!");

    } catch (e) {
        console.log("[FORWARD ERROR]", e);
        reply("❌ Forward failed");
    }
});
