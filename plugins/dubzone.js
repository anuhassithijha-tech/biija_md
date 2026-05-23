const { cmd } = require("../command");
const axios = require("axios");

const API_KEY =
    "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6";

cmd({
    pattern: "dub",
    desc: "Download Dubbed Movies",
    category: "movie",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return await reply("❌ Example: .dub Harry Potter");
        }

        await reply("🔎 *Searching Movies...*");

        // ================= SEARCH API =================

        const searchRes = await axios.get(
            "https://nexora.laksidunimsara.com/api/dubzone/search",
            {
                params: {
                    q: q,
                    api_key: API_KEY
                },
                timeout: 30000
            }
        );

        const searchData = searchRes.data;

        console.log(
            "SEARCH RESPONSE:",
            JSON.stringify(searchData, null, 2)
        );

        // API eke results / data dekama support
        const results =
            searchData.results ||
            searchData.data ||
            [];

        if (!searchData.status || !results.length) {
            return await reply("❌ No movies found");
        }

        const movies = results.slice(0, 15);

        let list = `╭━━〔 *DUB MOVIES* 〕━━⬣\n`;
        list += `┃ 🔍 Query: ${q}\n`;
        list += `╰━━━━━━━━━━━━━━⬣\n\n`;

        movies.forEach((movie, i) => {
            list += `*${i + 1}.* ${movie.title}\n`;
        });

        list += `\n_Reply with movie number_`;

        const sentMsg = await bot.sendMessage(
            from,
            { text: list },
            { quoted: mek }
        );

        const messageID = sentMsg.key.id;

        // ================= SELECT MOVIE =================

        const handleSelection = async ({ messages }) => {

            try {

                const msg = messages[0];
                if (!msg?.message) return;

                const text =
                    msg.message.conversation ||
                    msg.message.extendedTextMessage?.text;

                const isReply =
                    msg.message.extendedTextMessage
                        ?.contextInfo?.stanzaId === messageID;

                if (!isReply) return;
                if (msg.key.remoteJid !== from) return;

                bot.ev.off("messages.upsert", handleSelection);

                const choice = parseInt(text) - 1;

                if (
                    isNaN(choice) ||
                    choice < 0 ||
                    choice >= movies.length
                ) {
                    return await reply("❌ Invalid number");
                }

                const selected = movies[choice];

                // slug auto generate
                const slug =
                    selected.slug ||
                    selected.link
                        ?.split("/")
                        .filter(Boolean)
                        .pop();

                if (!slug) {
                    return await reply("❌ Movie slug not found");
                }

                await reply("📥 Fetching movie details...");

                // ================= DETAILS API =================

                const detailsRes = await axios.get(
                    "https://nexora.laksidunimsara.com/api/dubzone/movie",
                    {
                        params: {
                            url: selected.link,
                            slug: slug,
                            api_key: API_KEY
                        },
                        timeout: 30000
                    }
                );

                const detailsData = detailsRes.data;

                console.log(
                    "DETAILS RESPONSE:",
                    JSON.stringify(detailsData, null, 2)
                );

                const movie =
                    detailsData.data ||
                    detailsData.result ||
                    detailsData;

                if (!movie) {
                    return await reply("❌ Movie details not found");
                }

                const caption =
                    `🎬 *${movie.title || "Unknown"}*\n\n` +
                    `⭐ IMDb: ${movie.imdb_rating || "N/A"}\n` +
                    `📅 Year: ${movie.year || "N/A"}\n` +
                    `🎭 Genre: ${movie.genre || "N/A"}\n` +
                    `🌍 Country: ${movie.country || "N/A"}\n\n` +
                    `📖 ${movie.description?.slice(0, 400) || "No description available"}...`;

                // poster fallback
                const poster =
                    movie.poster ||
                    "https://files.catbox.moe/7an9on.jpg";

                await bot.sendMessage(
                    from,
                    {
                        image: { url: poster },
                        caption
                    },
                    { quoted: msg }
                );

                // ================= DOWNLOAD API =================

                const downloadRes = await axios.get(
                    "https://nexora.laksidunimsara.com/api/dubzone/downloads",
                    {
                        params: {
                            slug: slug,
                            api_key: API_KEY
                        },
                        timeout: 30000
                    }
                );

                const downloadData = downloadRes.data;

                console.log(
                    "DOWNLOAD RESPONSE:",
                    JSON.stringify(downloadData, null, 2)
                );

                const downloads =
                    downloadData.data?.download ||
                    downloadData.download ||
                    [];

                if (!downloads.length) {
                    return await reply("❌ Download links not found");
                }

                let dlText = `╭━━〔 *DOWNLOAD OPTIONS* 〕━━⬣\n\n`;

                downloads.forEach((dl, i) => {
                    dlText += `*${i + 1}.* ${dl.name || dl.quality || "Movie"}\n`;
                });

                dlText += `\n╰━━━━━━━━━━━━━━⬣\n`;
                dlText += `_Reply with download number_`;

                const dlMsg = await bot.sendMessage(
                    from,
                    { text: dlText },
                    { quoted: msg }
                );

                const dlMsgID = dlMsg.key.id;

                // ================= DOWNLOAD SELECT =================

                const handleDownload = async ({ messages }) => {

                    try {

                        const dMsg = messages[0];
                        if (!dMsg?.message) return;

                        const dText =
                            dMsg.message.conversation ||
                            dMsg.message.extendedTextMessage?.text;

                        const isDLReply =
                            dMsg.message.extendedTextMessage
                                ?.contextInfo?.stanzaId === dlMsgID;

                        if (!isDLReply) return;
                        if (dMsg.key.remoteJid !== from) return;

                        bot.ev.off(
                            "messages.upsert",
                            handleDownload
                        );

                        const dlChoice = parseInt(dText) - 1;

                        if (
                            isNaN(dlChoice) ||
                            dlChoice < 0 ||
                            dlChoice >= downloads.length
                        ) {
                            return await reply("❌ Invalid selection");
                        }

                        const selectedDL = downloads[dlChoice];

                        if (!selectedDL.url) {
                            return await reply(
                                "❌ Download URL not found"
                            );
                        }

                        await reply("⬇️ Sending movie file...");

                        await bot.sendMessage(
                            from,
                            {
                                document: {
                                    url: selectedDL.url
                                },
                                mimetype: "video/mp4",
                                fileName: `${movie.title || "movie"}.mp4`,
                                caption:
                                    `🎬 ${movie.title || "Movie"}\n` +
                                    `📥 ${selectedDL.name || "Download"}`
                            },
                            { quoted: dMsg }
                        );

                        await bot.sendMessage(from, {
                            react: {
                                text: "✅",
                                key: dMsg.key
                            }
                        });

                    } catch (err) {

                        console.log("DOWNLOAD ERROR:", err);

                        await reply(
                            "❌ Failed to send movie"
                        );
                    }
                };

                bot.ev.on(
                    "messages.upsert",
                    handleDownload
                );

                setTimeout(() => {
                    bot.ev.off(
                        "messages.upsert",
                        handleDownload
                    );
                }, 120000);

            } catch (err) {

                console.log("SELECTION ERROR:", err);

                await reply(
                    "❌ Failed to fetch movie details"
                );
            }
        };

        bot.ev.on(
            "messages.upsert",
            handleSelection
        );

        setTimeout(() => {
            bot.ev.off(
                "messages.upsert",
                handleSelection
            );
        }, 120000);

    } catch (error) {

        console.log("MAIN ERROR:", error);

        await reply("❌ Something went wrong");
    }
});
