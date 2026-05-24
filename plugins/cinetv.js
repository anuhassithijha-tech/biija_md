const { cmd } = require("../command");
const axios = require("axios");

const API_KEY = "lakiya_6dfa6b43064dd56b5c71acb12fc9b30e4d88dd0deb19c8b14f897d12fc87b8e6";
const BASE_URL = "https://nexora.laksidunimsara.com/cinesubz";
const DOWNLOAD_API = "https://new77777.vercel.app/movie/cinesubz";

cmd({
    pattern: "cinetv",
    desc: "Download Movies & TV Series from Cinesubz",
    category: "movie",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return await bot.sendMessage(from, {
                text: `❌ *Usage:* .cinetv <movie or series name>\n\n📌 *Example:* .cinetv true beauty\n📌 *Example:* .cinetv spider man`
            }, { quoted: mek });
        }

        await reply("📽️ *🔍 Searching on Cinesubz...*");
        const searchResponse = await axios.get(`${BASE_URL}/search`, {
            params: { query: q, api_key: API_KEY },
            timeout: 30000
        });

        const searchData = searchResponse.data;

        if (!searchData.status || !searchData.results?.length) {
            return await reply("❌ *No results found!*");
        }

        const results = searchData.results.slice(0, 15);
        let listText = `╭━━━━━━━━━━━━━━━━━━━╮\n` +
                      `┃ 🔍 *SEARCH RESULTS*\n` +
                      `┃ 📌 Query: _${q}_\n` +
                      `╰━━━━━━━━━━━━━━━━━━━╯\n\n` +
                      `*Reply with a number:*\n\n`;

        results.forEach((item, i) => {
            const type = item.link.includes('/tvshows/') ? '📺' : '🎬';
            listText += `*${i + 1}.* ${type} ${item.title}\n`;
        });
        listText += `\n_⏱️ Timeout: 60 seconds_`;

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
                const isTvShow = selected.link.includes('/tvshows/');
                
                if (isTvShow) {
                    await bot.sendMessage(from, { text: "📺 *Fetching TV series details...*" }, { quoted: replyMsg });
                    
                    try {
                        const tvResponse = await axios.get(`${BASE_URL}/tvshow`, {
                            params: { url: selected.link, api_key: API_KEY },
                            timeout: 30000
                        });
                        
                        const tvData = tvResponse.data;
                        
                        if (!tvData.status || !tvData.data) {
                            throw new Error("Failed to fetch TV series details");
                        }
                        
                        const tvInfo = tvData.data;
                        let seasonsText = `╭━━━━━━━━━━━━━━━━━━━╮\n` +
                                         `┃ 📺 *${tvInfo.title || tvInfo.series || "TV Series"}*\n` +
                                         `╰━━━━━━━━━━━━━━━━━━━╯\n\n` +
                                         `⭐ IMDb: ${tvInfo.imdb_rating || 'N/A'}\n` +
                                         `📅 Year: ${tvInfo.year || 'N/A'}\n` +
                                         `📀 Seasons: ${tvInfo.total_seasons || 'N/A'}\n` +
                                         `📊 Episodes: ${tvInfo.total_episodes || 'N/A'}\n\n` +
                                         `*Select season:*\n\n`;

                        tvInfo.seasons?.forEach((season, idx) => {
                            seasonsText += `*${idx + 1}.* Season ${season.season} (${season.total_episodes} eps)\n`;
                        });
                        
                        const posterUrl = tvInfo.poster || "https://i.imgur.com/8Km4jGk.jpeg";
                        
                        const seasonMsg = await bot.sendMessage(from, {
                            image: { url: posterUrl },
                            caption: seasonsText
                        }, { quoted: replyMsg });
                        const seasonMsgID = seasonMsg.key.id;
                        const handleSeasonSelect = async ({ messages: seasonMessages }) => {
                            const seasonMek = seasonMessages[0];
                            if (!seasonMek?.message) return;
                            
                            const seasonText = seasonMek.message.conversation || seasonMek.message.extendedTextMessage?.text;
                            const isReplyToSeason = seasonMek.message.extendedTextMessage?.contextInfo?.stanzaId === seasonMsgID;
                            
                            if (isReplyToSeason && from === seasonMek.key.remoteJid) {
                                clearTimeout(seasonTimeout);
                                bot.ev.off('messages.upsert', handleSeasonSelect);
                                
                                const seasonNum = parseInt(seasonText) - 1;
                                if (isNaN(seasonNum) || seasonNum < 0 || seasonNum >= tvInfo.seasons.length) {
                                    return await bot.sendMessage(from, { text: "❌ *Invalid season number!*" }, { quoted: seasonMek });
                                }
                                
                                const selectedSeason = tvInfo.seasons[seasonNum];
                                const episodesList = selectedSeason.episodes || [];
                                
                                if (!episodesList.length) {
                                    return await bot.sendMessage(from, { text: "❌ *No episodes found!*" }, { quoted: seasonMek });
                                }
                                
                                
                                let episodesText = `╭━━━━━━━━━━━━━━━━━━━╮\n` +
                                                 `┃ 📺 *${tvInfo.title || tvInfo.series} - S${selectedSeason.season}*\n` +
                                                 `╰━━━━━━━━━━━━━━━━━━━╯\n\n` +
                                                 `📊 Total: ${episodesList.length} episodes\n\n` +
                                                 `*Select episode:*\n\n`;

                                episodesList.slice(0, 30).forEach((ep, idx) => {
                                    const epNum = ep.episode || idx + 1;
                                    const epTitle = ep.title ? ep.title.substring(0, 40) : `Episode ${epNum}`;
                                    episodesText += `*${idx + 1}.* E${epNum}: ${epTitle}\n`;
                                });
                                
                                if (episodesList.length > 30) {
                                    episodesText += `\n_*Showing first 30 episodes_*\n`;
                                }
                                
                                const episodeMsg = await bot.sendMessage(from, { text: episodesText }, { quoted: seasonMek });
                                const episodeMsgID = episodeMsg.key.id;
                                const handleEpisodeSelect = async ({ messages: episodeMessages }) => {
                                    const episodeMek = episodeMessages[0];
                                    if (!episodeMek?.message) return;
                                    
                                    const episodeChoice = episodeMek.message.conversation || episodeMek.message.extendedTextMessage?.text;
                                    const isReplyToEpisode = episodeMek.message.extendedTextMessage?.contextInfo?.stanzaId === episodeMsgID;
                                    
                                    if (isReplyToEpisode && from === episodeMek.key.remoteJid) {
                                        clearTimeout(episodeTimeout);
                                        bot.ev.off('messages.upsert', handleEpisodeSelect);
                                        
                                        const epNum = parseInt(episodeChoice) - 1;
                                        if (isNaN(epNum) || epNum < 0 || epNum >= episodesList.length) {
                                            return await bot.sendMessage(from, { text: "❌ *Invalid episode number!*" }, { quoted: episodeMek });
                                        }
                                        
                                        const selectedEpisode = episodesList[epNum];
                                        const episodeUrl = selectedEpisode.url;
                                        
                                        if (!episodeUrl) {
                                            return await bot.sendMessage(from, { text: "❌ *Episode URL not found!*" }, { quoted: episodeMek });
                                        }
                                        
                                        await bot.sendMessage(from, { text: `📥 *Getting download link for S${selectedSeason.season}E${selectedEpisode.episode || epNum + 1}...*` }, { quoted: episodeMek });
                                        
                                        try {
                                            const epDetailRes = await axios.get(`${BASE_URL}/episode`, {
                                                params: { url: episodeUrl, api_key: API_KEY },
                                                timeout: 30000
                                            });
                                            
                                            const epData = epDetailRes.data;
                                            
                                            let downloadUrl = null;
                                            let quality = "HD";
                                            
                                            if (epData.data?.download_links && epData.data.download_links.length > 0) {
                                                const validLinks = epData.data.download_links.filter(l => l.url);
                                                if (validLinks.length > 0) {
                                                    downloadUrl = validLinks[0].url;
                                                    quality = validLinks[0].quality || validLinks[0].type || "HD";
                                                }
                                            }
                                            
                                            if (!downloadUrl && epData.data?.season_episodes) {
                                                const activeEp = epData.data.season_episodes.find(ep => ep.is_active === true);
                                                if (activeEp && activeEp.url) {
                                                    downloadUrl = activeEp.url;
                                                    quality = "WEB-DL";
                                                }
                                            }
                                            
                                            if (!downloadUrl) {
                                                return await bot.sendMessage(from, { 
                                                    text: `⚠️ *No direct download link!*\n\n📺 Watch online:\n${episodeUrl}` 
                                                }, { quoted: episodeMek });
                                            }
                                            
                                            await bot.sendMessage(from, { text: `⏳ *Processing...*` }, { quoted: episodeMek });
                                            
                                            const finalRes = await axios.get(`${DOWNLOAD_API}?url=${encodeURIComponent(downloadUrl)}&api_key=${API_KEY}`, {
                                                timeout: 60000
                                            });
                                            
                                            const finalData = finalRes.data;
                                            const links = finalData.data?.download || [];
                                            const bestLink = links.find(l => l.name === "unknown") || links[0];
                                            
                                            if (!bestLink?.url) throw new Error("No download URL found");
                                            
                                            await bot.sendMessage(from, {
                                                document: { url: bestLink.url },
                                                mimetype: 'video/mp4',
                                                fileName: `${tvInfo.title || tvInfo.series || "Episode"} S${selectedSeason.season}E${selectedEpisode.episode || epNum + 1}.mp4`,
                                                caption: `✅ *${tvInfo.title || tvInfo.series}*\n📀 S${selectedSeason.season}E${selectedEpisode.episode || epNum + 1}\n🎬 ${selectedEpisode.title || "Episode"}`
                                            }, { quoted: episodeMek });
                                            
                                            await bot.sendMessage(from, { react: { text: "✅", key: episodeMek.key } });
                                            
                                        } catch (err) {
                                            console.error("Episode download error:", err);
                                            await bot.sendMessage(from, { text: `❌ *Download failed!\n\nTry watching online:\n${episodeUrl}` }, { quoted: episodeMek });
                                        }
                                    }
                                };
                                
                                const episodeTimeout = setTimeout(() => {
                                    bot.ev.off('messages.upsert', handleEpisodeSelect);
                                    bot.sendMessage(from, { text: "⏰ *Timeout! Please try again.*" }, { quoted: seasonMek });
                                }, 60000);
                                bot.ev.on('messages.upsert', handleEpisodeSelect);
                            }
                        };
                        
                        const seasonTimeout = setTimeout(() => {
                            bot.ev.off('messages.upsert', handleSeasonSelect);
                            bot.sendMessage(from, { text: "⏰ *Timeout! Please try again.*" }, { quoted: replyMsg });
                        }, 60000);
                        bot.ev.on('messages.upsert', handleSeasonSelect);
                        
                    } catch (err) {
                        console.error("TV Series Error:", err);
                        await bot.sendMessage(from, { text: "❌ *Failed to fetch TV series details!*" }, { quoted: replyMsg });
                    }
                    
                } else {
                    await bot.sendMessage(from, { text: "📥 *Fetching movie details...*" }, { quoted: replyMsg });
                    
                    try {
                        const detailsRes = await axios.get(`${BASE_URL}/details`, {
                            params: { url: selected.link, api_key: API_KEY },
                            timeout: 30000
                        });
                        
                        const movie = detailsRes.data.data;
                        const validDownloads = movie.downloads?.filter(d => d?.quality && d?.url) || [];
                        
                        if (!validDownloads.length) return await reply("❌ *No download options available*");
                        
                        let infoText = `╭━━━━━━━━━━━━━━━━━━━╮\n` +
                                     `┃ 🎬 *${movie.title}*\n` +
                                     `╰━━━━━━━━━━━━━━━━━━━╯\n\n` +
                                     `⭐ IMDb: ${movie.imdb_rating || 'N/A'}\n` +
                                     `📅 Year: ${movie.year || 'N/A'}\n` +
                                     `🎬 Director: ${movie.director || 'N/A'}\n` +
                                     `🌍 Country: ${movie.country || 'N/A'}\n\n` +
                                     `📖 Story:\n${movie.description?.substring(0, 200)}${movie.description?.length > 200 ? '...' : ''}\n\n` +
                                     `*Select quality:*\n\n`;

                        validDownloads.forEach((dl, i) => {
                            infoText += `*${i + 1}.* ${dl.quality} - ${dl.size || 'Unknown'}\n`;
                        });
                        const posterUrl = movie.poster || "bot logo";
                        
                        await bot.sendMessage(from, {
                            image: { url: posterUrl },
                            caption: infoText
                        }, { quoted: replyMsg });
                        const downloadHandler = async ({ messages: dlMsgs }) => {
                            const dlMsg = dlMsgs[0];
                            if (!dlMsg?.message) return;
                            
                            const dlText = dlMsg.message.conversation || dlMsg.message.extendedTextMessage?.text;
                            const dlChoice = parseInt(dlText) - 1;
                            
                            if (from === dlMsg.key.remoteJid && !isNaN(dlChoice) && dlChoice >= 0 && dlChoice < validDownloads.length) {
                                clearTimeout(dlTimeout);
                                bot.ev.off('messages.upsert', downloadHandler);
                                
                                const selectedDL = validDownloads[dlChoice];
                                await bot.sendMessage(from, { text: `⬇️ *Sending ${selectedDL.quality}...*` }, { quoted: dlMsg });
                                
                                try {
                                    const finalRes = await axios.get(`${DOWNLOAD_API}?url=${encodeURIComponent(selectedDL.url)}&api_key=${API_KEY}`, {
                                        timeout: 60000
                                    });
                                    
                                    const finalData = finalRes.data;
                                    const links = finalData.data?.download || [];
                                    const bestLink = links.find(l => l.name === "unknown") || links[0];
                                    
                                    if (!bestLink?.url) throw new Error("No download link");
                                    
                                    await bot.sendMessage(from, {
                                        document: { url: bestLink.url },
                                        mimetype: 'video/mp4',
                                        fileName: `${movie.title} - ${selectedDL.quality}.mp4`,
                                        caption: `✅ *${movie.title}*\n📀 Quality: ${selectedDL.quality}\n💾 Size: ${selectedDL.size || 'Unknown'}`
                                    }, { quoted: dlMsg });
                                    
                                    await bot.sendMessage(from, { react: { text: "✅", key: dlMsg.key } });
                                } catch (err) {
                                    console.error(err);
                                    await bot.sendMessage(from, { text: "❌ *Failed to send file!*" }, { quoted: dlMsg });
                                }
                            }
                        };
                        
                        const dlTimeout = setTimeout(() => {
                            bot.ev.off('messages.upsert', downloadHandler);
                            bot.sendMessage(from, { text: "⏰ *Timeout! Please try again.*" }, { quoted: mek });
                        }, 60000);
                        bot.ev.on('messages.upsert', downloadHandler);
                        
                    } catch (err) {
                        console.error("Movie error:", err);
                        await bot.sendMessage(from, { text: "❌ *Failed to fetch movie details!*" }, { quoted: replyMsg });
                    }
                }
            }
        };
        
        const selectionTimeout = setTimeout(() => {
            bot.ev.off('messages.upsert', handleSelection);
            bot.sendMessage(from, { text: "⏰ *Timeout! Please try again.*" }, { quoted: mek });
        }, 60000);
        bot.ev.on('messages.upsert', handleSelection);
        
    } catch (error) {
        console.error("Cinesubz Error:", error);
        await reply("❌ *Something went wrong!*\n\n" + error.message);
    }
});
