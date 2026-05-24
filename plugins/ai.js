const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt"],
    desc: "Chat with AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("❌ Example:\n.ai hello");
        }

        // FREE AI API
        const res = await axios.get(
            `https://api.giftedtech.web.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(q)}`
        );

        const msg = res.data.result || "No response";

        await conn.sendMessage(from, {
            text: `🤖 *CHATGPT AI*\n\n${msg}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);

        reply("❌ AI server error");
    }
});
