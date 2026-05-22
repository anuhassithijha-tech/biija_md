const { cmd } = require("../command");
const axios = require("axios");
cmd({
    pattern: "cinesubz",
    desc: "Download movies",
    category: "movie",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return await bot.sendMessage(from, {
                text: `❌ ex: .cinesubz spider man`
            }, { quoted: mek });
        }
        await reply("📽️ *Searching on Cinesubz...*");
        const searchResponse = await axios.get(`https://nexora.laksidunimsara.com/cinesubz/search`, {
            params: {
                query: q,
                api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
            },
            timeout: 30000
        });

        const searchData = searchResponse.data;

        if (!searchData.status || !searchData.results?.length) {
            return await reply("❌ *No results found!*");
        }

        const results = searchData.results.slice(0, 20);
        let listText = `───────────
 *SEARCH :* _${q}_
───────────
*🎥 SELECT YOUR MOVIE*
───────────
*Reply with a number 👇*\n\n`;

        results.forEach((item, i) => {
            listText += `*${i + 1}.* ${item.title}\n`;
        });
        listText += `───────────`;
        const sentMsg = await bot.sendMessage(from, { text: listText }, { quoted: mek });
        const messageID = sentMsg.key.id;
        const handleSelection = async ({ messages }) => {
            const replyMsg = messages[0];
            if (!replyMsg?.message) return;
            const text = replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text;
            const isReply = replyMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;
            if (isReply && from === replyMsg.key.remoteJid) {
                clearTimeout(selectionTimeout);
                bot.ev.off('messages.upsert', handleSelection);
                const choice = parseInt(text) - 1;
                if (isNaN(choice) || choice < 0 || choice >= results.length) {
                    return await reply("❌ *Invalid number!*");
                }
                const selected = results[choice];
                await bot.sendMessage(from, { text: "📥 *Fetching details...*" }, { quoted: replyMsg });
                const detailsRes = await axios.get(`https://nexora.laksidunimsara.com/cinesubz/details`, {
                    params: {
                        url: selected.link,
                        api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
                    }
                });
                const movie = detailsRes.data.data;
                const validDownloads = movie.downloads?.filter(d => d?.quality) || [];
                if (!validDownloads.length) return await reply("❌ *No download options available*");
                const infoText = `☘️ *${movie.title}*\n\n` +
                    `⭐ IMDb: ${movie.imdb_rating || 'N/A'}\n` +
                    `📅 Year: ${movie.year || 'N/A'}\n` +
                    `🎬 Director: ${movie.director || 'N/A'}\n` +
                    `🌍 Country: ${movie.country || 'N/A'}\n\n` +
                    `📖 *Story:*\n${movie.description?.substring(0, 280)}${movie.description?.length > 280 ? '...' : ''}`;

                await bot.sendMessage(from, {
                    image: { url: movie.poster || "bot image eka danna" },
                    caption: infoText
                }, { quoted: replyMsg });
                let dlText = `*⬇️ DOWNLOAD OPTIONS*\nReply with number:\n\n`;
                validDownloads.forEach((dl, i) => {
                    dlText += `*${i + 1}.* ${dl.quality} - ${dl.size || 'Unknown size'}\n`;
                });

                const dlMsg = await bot.sendMessage(from, { text: dlText }, { quoted: replyMsg });
                const dlMsgID = dlMsg.key.id;

                const handleDownload = async ({ messages: dMsgs }) => {
                    const dMsg = dMsgs[0];
                    if (!dMsg?.message) return;

                    const dText = dMsg.message.conversation || dMsg.message.extendedTextMessage?.text;
                    const isDLReply = dMsg.message.extendedTextMessage?.contextInfo?.stanzaId === dlMsgID;

                    if (isDLReply && from === dMsg.key.remoteJid) {
                        clearTimeout(downloadTimeout);
                        bot.ev.off('messages.upsert', handleDownload);
                        const dlChoice = parseInt(dText) - 1;
                        if (isNaN(dlChoice) || dlChoice < 0 || dlChoice >= validDownloads.length) {
                            return await reply("❌ *Invalid selection!*");
                        }
                        const selectedDL = validDownloads[dlChoice];
                        await bot.sendMessage(from, { text: `⬇️ *Sending ${selectedDL.quality}...*` }, { quoted: dMsg });
                        try {
                            const finalRes = await axios.get(`https://new77777.vercel.app/movie/cinesubz?url=${encodeURIComponent(selectedDL.url)}&api_key=lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6`);
                            const finalData = finalRes.data;
                            const links = finalData.data?.download || [];
                            const bestLink = links.find(l => l.name === "unknown") || links[0];
                            if (!bestLink?.url) throw new Error("No download link");
                            await bot.sendMessage(from, {
                                document: { url: bestLink.url },
                                mimetype: 'video/mp4',
                                fileName: `${movie.title} - ${selectedDL.quality}.mp4`,
                                caption: `✅ *${movie.title}*\n📀 Quality: ${selectedDL.quality}\n💾 Size: ${selectedDL.size || 'Unknown'}`
                            }, { quoted: dMsg });

                            await bot.sendMessage(from, { react: { text: "✅", key: dMsg.key } });
                        } catch (err) {
                            console.error(err);
                            await reply("❌ *Failed to send file!*");
                        }
                    }
                };
                const downloadTimeout = setTimeout(() => bot.ev.off('messages.upsert', handleDownload), 120000);
                bot.ev.on('messages.upsert', handleDownload);
            }
        };
        const selectionTimeout = setTimeout(() => bot.ev.off('messages.upsert', handleSelection), 120000);
        bot.ev.on('messages.upsert', handleSelection);

    } catch (error) {
        console.error("Cinesubz Error:", error);
        await reply("❌ *Something went wrong!*");
    }
});
