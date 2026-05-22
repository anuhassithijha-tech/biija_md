const { commands } = require('../command');

commands.push({
    pattern: "forward",
    alias: ["fw"],
    react: "📨",
    desc: "Forward replied message",
    category: "owner",

    async function(danuwa, mek, m, {
        body,
        reply,
        senderNumber
    }) {

        try {

            // OWNER NUMBER
            const owners = ["94742838813"];

            if (!owners.includes(senderNumber)) {
                return reply("❌ Owner only");
            }

            // MUST REPLY
            const quoted = mek.message?.extendedTextMessage?.contextInfo;

            if (!quoted || !quoted.quotedMessage) {
                return reply("⚠️ Reply to a message");
            }

            // TARGET JID
            const args = body.trim().split(" ");
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.forward 94761234567@s.whatsapp.net`
                );
            }

            // FORWARD REAL MESSAGE
            await danuwa.relayMessage(
                jid,
                quoted.quotedMessage,
                {}
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
