module.exports = {
    name: 'forward',
    alias: ['fw'],
    desc: 'Forward replied message',
    category: 'owner',

    async execute(conn, mek, m, {
        reply,
        isOwner
    }) {

        try {

            if (!isOwner) {
                return reply('❌ Owner only command');
            }

            // must reply message
            if (!m.quoted) {
                return reply('⚠️ Reply to a message');
            }

            // get jid
            const args = m.body.split(' ');
            const jid = args[1];

            if (!jid) {
                return reply(
`⚠️ Example:

.forward 94761234567@s.whatsapp.net`
                );
            }

            // forward message
            await conn.sendMessage(jid, {
                forward: m.quoted
            });

            reply('✅ Message forwarded successfully');

        } catch (e) {
            console.log(e);
            reply('❌ Forward failed');
        }
    }
}
