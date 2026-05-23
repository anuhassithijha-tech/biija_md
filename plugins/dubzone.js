const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "dub",
    desc: "Download movies",
    category: "movie",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return await reply("❌ Example: .dub Harry Potter");
        }

        await reply("🔎 *Searching Movies...*");

        // SEARCH API
        const searchRes = await axios.get(
            "https://nexora.laksidunimsara.com/api/dubzone/search",
            {
                params: {
                    q: q,
                    api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
                }
            }
        );

        const searchData = searchRes.data;

        if (!searchData.status || !searchData.results?.length) {
            return await reply("❌ No movies found");
        }

        const results = searchData.results.slice(0, 15);

        let text = `╭━━〔 *DUB MOVIES* 〕━━⬣\n`;
        text += `┃ 🔍 Query: ${q}\n`;
        text += `╰━━━━━━━━━━━━━━⬣\n\n`;

        results.forEach((v, i) => {
            text += `*${i + 1}.* ${v.title}\n`;
        });

        text += `\n_Reply with movie number_`;

        const sent = await bot.sendMessage(
            from,
            { text },
            { quoted: mek }
        );

        const msgID = sent.key.id;

        const handleReply = async ({ messages }) => {

            const msg = messages[0];
            if (!msg.message) return;

            const body =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text;

            const isReply =
                msg.message.extendedTextMessage?.contextInfo?.stanzaId === msgID;

            if (!isReply) return;
            if (msg.key.remoteJid !== from) return;

            bot.ev.off("messages.upsert", handleReply);

            const index = parseInt(body) - 1;

            if (isNaN(index) || index < 0 || index >= results.length) {
                return await reply("❌ Invalid Number");
            }

            const selected = results[index];

            await reply("📥 Fetching movie details...");

            // MOVIE DETAILS API
            const detailsRes = await axios.get(
                "https://nexora.laksidunimsara.com/api/dubzone/movie",
                {
                    params: {
                        url: selected.link,
                        slug: selected.slug,
                        api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc87b8e6"
                    }
                }
            );

            const movie = detailsRes.data.data;

            if (!movie) {
                return await reply("❌ Movie details not found");
            }

            let caption =
                `🎬 *${movie.title}*\n\n` +
                `⭐ IMDb: ${movie.imdb_rating || "N/A"}\n` +
                `📅 Year: ${movie.year || "N/A"}\n` +
                `🌍 Country: ${movie.country || "N/A"}\n\n` +
                `📖 ${movie.description?.slice(0, 300) || "No Description"}...`;

            await bot.sendMessage(
                from,
                {
                    image: { url: movie.poster },
                    caption
                },
                { quoted: msg }
            );

            // DOWNLOAD API
            const dlRes = await axios.get(
                "https://nexora.laksidunimsara.com/api/dubzone/downloads",
                {
                    params: {
                        slug: selected.slug,
                        api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc87b8e6"
                    }
                }
            );

            const dlData = dlRes.data;

            if (!dlData.status || !dlData.data?.download?.length) {
                return await reply("❌ Download links not found");
            }

            const links = dlData.data.download;

            let dlText = `╭━━〔 *DOWNLOAD OPTIONS* 〕━━⬣\n\n`;

            links.forEach((v, i) => {
                dlText += `*${i + 1}.* ${v.name || "Quality"}\n`;
            });

            dlText += `\n╰━━━━━━━━━━━━━━⬣\n`;
            dlText += `_Reply with download number_`;

            const dlMsg = await bot.sendMessage(
                from,
                { text: dlText },
                { quoted: msg }
            );

            const dlMsgID = dlMsg.key.id;

            const handleDL = async ({ messages }) => {

                const dmsg = messages[0];
                if (!dmsg.message) return;

                const body2 =
                    dmsg.message.conversation ||
                    dmsg.message.extendedTextMessage?.text;

                const isReply2 =
                    dmsg.message.extendedTextMessage?.contextInfo?.stanzaId === dlMsgID;

                if (!isReply2) return;
                if (dmsg.key.remoteJid !== from) return;

                bot.ev.off("messages.upsert", handleDL);

                const choose = parseInt(body2) - 1;

                if (isNaN(choose) || choose < 0 || choose >= links.length) {
                    return await reply("❌ Invalid Download Number");
                }

                const file = links[choose];

                await reply("⬇️ Sending Movie File...");

                await bot.sendMessage(
                    from,
                    {
                        document: { url: file.url },
                        mimetype: "video/mp4",
                        fileName: `${movie.title}.mp4`,
                        caption:
                            `🎬 ${movie.title}\n` +
                            `📥 ${file.name || "Movie"}`
                    },
                    { quoted: dmsg }
                );

                await bot.sendMessage(from, {
                    react: {
                        text: "✅",
                        key: dmsg.key
                    }
                });

            };

            bot.ev.on("messages.upsert", handleDL);

            setTimeout(() => {
                bot.ev.off("messages.upsert", handleDL);
            }, 120000);

        };

        bot.ev.on("messages.upsert", handleReply);

        setTimeout(() => {
            bot.ev.off("messages.upsert", handleReply);
        }, 120000);

    } catch (e) {
        console.log(e);
        return await reply("❌ Error occurred");
    }

});
