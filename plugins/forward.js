const { commands } = require('../command');

commands.push({
    pattern: "forward",
    alias: ["fw"],
    react: "📨",
    desc: "Forward messages",
    category: "owner",

    async function(danuwa, mek, m, {
        body,
        reply,
        isOwner
    }) {

        try {

            if (!isOwner) {
                return reply("❌ Owner only");
            }

            // reply check
            if (!mek.message.extendedTextMessage) {
                return reply("⚠️ Reply to a message");
            }

            // jid
            const args = body.split(" ");
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.forward 94761234567@s.whatsapp.net`
                );
            }

            // context info
            const context = mek.message.extendedTextMessage.contextInfo;

            // forward
            await danuwa.sendMessage(
                jid,
                {
                    forward: {
                        key: {
                            remoteJid: mek.key.remoteJid,
                            id: context.stanzaId,
                            participant: context.participant
                        },
                        message: context.quotedMessage
                    }
                }
            );

            return reply("✅ Forwarded Successfully");

        } catch (err) {

            console.log(err);

            return reply(
`❌ Error

${err}`
            );
        }
    }
});
