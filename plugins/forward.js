const { commands } = require('../command');

commands.push({
    pattern: "forward",
    alias: ["fw"],
    react: "📨",
    desc: "Forward replied media/message",
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

            // MUST REPLY
            const quoted =
                mek.message?.extendedTextMessage?.contextInfo;

            if (!quoted || !quoted.quotedMessage) {
                return reply("⚠️ Reply to a photo/video/document");
            }

            // TARGET JID
            const args = body.trim().split(" ");
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.fw 103225277559013@lid`
                );
            }

            // CREATE REAL WEB MESSAGE
            const message = {
                key: {
                    remoteJid: mek.key.remoteJid,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                },
                message: quoted.quotedMessage
            };

            // FORWARD
            await danuwa.copyNForward(
                jid,
                message,
                true
            );

            return reply("✅ Successfully forwarded!");

        } catch (err) {

            console.log(err);

            return reply(
`❌ Error

${err}`
            );
        }
    }
});
