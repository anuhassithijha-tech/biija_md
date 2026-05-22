const { commands } = require('../command');

commands.push({
    pattern: "fw",
    alias: ["forward"],
    react: "📨",
    desc: "Forward replied media",
    category: "owner",

    async function(danuwa, mek, m, {
        body,
        reply,
        senderNumber
    }) {

        try {

            // OWNER
            const owners = ["9442838813"];

            if (!owners.includes(senderNumber)) {
                return reply("❌ Owner only");
            }

            // MUST REPLY
            const context =
                mek.message?.extendedTextMessage?.contextInfo;

            if (!context?.quotedMessage) {
                return reply("⚠️ Reply to media/message");
            }

            // JID
            const jid = body.split(" ")[1];

            if (!jid) {
                return reply(
`Example:

.fw 103225277559013@lid`
                );
            }

            // GET REAL QUOTED MESSAGE
            const msg = context.quotedMessage;

            // SEND EXACT MESSAGE
            await danuwa.sendMessage(
                jid,
                msg
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
