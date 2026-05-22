const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "pupilmovie",
    desc: "Download movies",
    category: "movie",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return await bot.sendMessage(from, {
                text: `❌ ex: .pupilmovie spider man`
            }, { quoted: mek });
        }

        await reply("📽️ *Searching Movies...*");

        // SEARCH API
        const searchResponse = await axios.get(
            `https://nexora.laksidunimsara.com/pupilvideo/search`,
            {
                params: {
                    query: q,
                    api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
                },
                timeout: 30000
            }
        );

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

        const sentMsg = await bot.sendMessage(
            from,
            { text: listText },
            { quoted: mek }
        );

        const messageID = sentMsg.key.id;

        const handleSelection = async ({ messages }) => {

            const replyMsg = messages[0];

            if (!replyMsg?.message) return;

            const text =
                replyMsg.message.conversation ||
                replyMsg.message.extendedTextMessage?.text;

            const isReply =
                replyMsg.message.extendedTextMessage
                    ?.contextInfo?.stanzaId === messageID;

            if (isReply && from === replyMsg.key.remoteJid) {

                clearTimeout(selectionTimeout);

                bot.ev.off("messages.upsert", handleSelection);

                const choice = parseInt(text) - 1;

                if (
                    isNaN(choice) ||
                    choice < 0 ||
                    choice >= results.length
                ) {
                    return await reply("❌ *Invalid number!*");
                }

                const selected = results[choice];

                await bot.sendMessage(from, {
                    text: "📥 *Fetching movie details...*"
                }, { quoted: replyMsg });

                // MOVIE DETAILS API
                const detailsRes = await axios.get(
                    `https://nexora.laksidunimsara.com/pupilvideo/movie`,
                    {
                        params: {
                            url: selected.link,
                            api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
                        },
                        timeout: 30000
                    }
                );

                const movie = detailsRes.data.data;

                const infoText =
`☘️ *${movie.title || selected.title}*

⭐ IMDb: ${movie.imdb_rating || 'N/A'}
📅 Year: ${movie.year || 'N/A'}
🎬 Director: ${movie.director || 'N/A'}
🌍 Country: ${movie.country || 'N/A'}

📖 *Story:*
${movie.description?.substring(0, 300) || 'No Description'}
`;

                await bot.sendMessage(from, {
                    image: {
                        url: movie.poster || "https://i.imgur.com/JqEuJ6t.jpeg"
                    },
                    caption: infoText
                }, { quoted: replyMsg });

                let dlText = `*⬇️ DOWNLOAD MOVIE*\n\n`;
                dlText += `*Reply with 1 to send movie*`;

                const dlMsg = await bot.sendMessage(
                    from,
                    { text: dlText },
                    { quoted: replyMsg }
                );

                const dlMsgID = dlMsg.key.id;

                const handleDownload = async ({ messages: dMsgs }) => {

                    const dMsg = dMsgs[0];

                    if (!dMsg?.message) return;

                    const dText =
                        dMsg.message.conversation ||
                        dMsg.message.extendedTextMessage?.text;

                    const isDLReply =
                        dMsg.message.extendedTextMessage
                            ?.contextInfo?.stanzaId === dlMsgID;

                    if (isDLReply && from === dMsg.key.remoteJid) {

                        clearTimeout(downloadTimeout);

                        bot.ev.off(
                            "messages.upsert",
                            handleDownload
                        );

                        if (dText !== "1") {
                            return await reply(
                                "❌ *Reply with 1 only*"
                            );
                        }

                        await bot.sendMessage(from, {
                            text: `⬇️ *Sending Movie...*`
                        }, { quoted: dMsg });

                        try {

                            // WATCH API
                            const finalRes = await axios.get(
                                `https://nexora.laksidunimsara.com/pupilvideo/watch`,
                                {
                                    params: {
                                        url: selected.link,
                                        api_key: "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6"
                                    },
                                    timeout: 60000
                                }
                            );

                            console.log(finalRes.data);

                            const videoUrl =
                                finalRes.data?.data?.url;

                            if (!videoUrl) {
                                return await reply(
                                    "❌ *Movie link not found!*"
                                );
                            }

                            await bot.sendMessage(from, {

                                video: {
                                    url: videoUrl
                                },

                                mimetype: "video/mp4",

                                caption:
`✅ *${movie.title || selected.title}*`

                            }, { quoted: dMsg });

                            await bot.sendMessage(from, {
                                react: {
                                    text: "✅",
                                    key: dMsg.key
                                }
                            });

                        } catch (err) {

                            console.log(err);

                            await reply(
                                "❌ *Failed to send movie!*"
                            );

                        }

                    }

                };

                const downloadTimeout = setTimeout(() => {

                    bot.ev.off(
                        "messages.upsert",
                        handleDownload
                    );

                }, 120000);

                bot.ev.on(
                    "messages.upsert",
                    handleDownload
                );

            }

        };

        const selectionTimeout = setTimeout(() => {

            bot.ev.off(
                "messages.upsert",
                handleSelection
            );

        }, 120000);

        bot.ev.on(
            "messages.upsert",
            handleSelection
        );

    } catch (error) {

        console.error("PupilMovie Plugin Error:", error);

        await reply("❌ *Something went wrong!*");

    }

});
