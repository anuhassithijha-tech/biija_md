const { cmd } = require("../command");

cmd({
    pattern: "forward",
    alias: ["fw"],
    desc: "Forward message to a JID",
    category: "tools",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {

    try {
        if (!args[0]) return reply("❌ JID එක දෙන්න\nExample: .forward 9477xxxx@s.whatsapp.net hello");

        const jid = args[0];

        if (!jid.includes("@s.whatsapp.net") && !jid.includes("@g.us")) {
            return reply("❌ Invalid JID format!");
        }

        const message = args.slice(1).join(" ");

        if (!message) return reply("❌ Message එකක් දෙන්න");

        await conn.sendMessage(jid, { text: message });

        reply("✅ Message forwarded successfully!");

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred while forwarding");
    }
});
