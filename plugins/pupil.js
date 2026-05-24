const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "pupil",
    desc: "Search & Download movies (ALL IN ONE)",
    category: "movie",
    filename: __filename
},
async (conn, mek, m, { reply }) => {

    let input = m.body.split(" ").slice(1).join(" ").trim();

    if (!input) {
        return reply(
`🎬 *MOVIE SYSTEM*

📌 Use:
.movie Harry Potter  → search
.movie <movie url>   → download`
        );
    }

    try {

        // ===============================
        // 1️⃣ IF INPUT IS URL → DOWNLOAD
        // ===============================
        if (input.startsWith("http")) {

            let api = `https://nexora.laksidunimsara.com/pupilvideo/movie?url=${encodeURIComponent(input)}&api_key=lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6`;

            let { data } = await axios.get(api);

            if (!data) return reply("❌ API error");

            let title = data.title || "Unknown Movie";
            let download = data.download_url || data.url || data.link;

            if (!download) return reply("❌ Download link not found");

            return reply(
`🎬 *MOVIE READY*

📌 Title: ${title}

📥 Download Link:
${download}

⚡ Enjoy!`
            );
        }

        // ===============================
        // 2️⃣ ELSE → SEARCH MOVIES
        // ===============================

        let api = `https://nexora.laksidunimsara.com/pupilvideo/search?query=${encodeURIComponent(input)}&api_key=lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6`;

        let { data } = await axios.get(api);

        if (!data?.results?.length) {
            return reply("❌ කිසිම movie එකක් හම්බුනේ නෑ");
        }

        let text = `🎬 *MOVIE RESULTS*\n\n`;

        data.results.slice(0, 7).forEach((v, i) => {
            text += `*${i + 1}.* ${v.title}\n🔗 ${v.url}\n\n`;
        });

        text += `📌 Now copy link & use:\n.movie <url>`;

        reply(text);

    } catch (e) {
        console.log(e);
        reply("❌ API error / server issue");
    }
});
