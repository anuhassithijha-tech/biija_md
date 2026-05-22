const { commands } = require('../command');

commands.push({
    pattern: "forward",
    alias: ["fw"],
    react: "📨",
    desc: "Forward replied message/media",
    category: "owner",

    async function(danuwa, mek, m, {
        body,
        reply,
        senderNumber
    }) {

        try {

            // OWNER CHECK
            const owners = ["94742838813"];

            if (!owners.includes(senderNumber)) {
                return reply("❌ Owner only");
            }

            // CHECK REPLY
            if (!mek.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                return reply("⚠️ Reply to a message/media");
            }

            const context =
                mek.message.extendedTextMessage.contextInfo;

            // TARGET JID
            const args = body.trim().split(" ");
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.fw 94761234567@s.whatsapp.net`
                );
            }

            // BUILD REAL QUOTED MESSAGE
            const quotedMsg = {
                key: {
                    remoteJid: mek.key.remoteJid,
                    fromMe: false,
                    id: context.stanzaId,
                    participant: context.participant
                },
                message: context.quotedMessage
            };

            // FORWARD
            await danuwa.copyNForward(
                jid,
                quotedMsg,
                true
            );

            return reply("✅ Successfully forwarded!");

        } catch (e) {

            console.log(e);

            return reply(
`❌ Error

${e}`
            );
        }
    }
});
