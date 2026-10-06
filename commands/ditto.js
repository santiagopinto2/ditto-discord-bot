const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transform')
		.setDescription('Repeats back message mimicking selected user')
        .addUserOption(option =>
			option
				.setName('target')
				.setDescription('Member to copy')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('Message to display')
				.setRequired(true)),

    async execute(interaction) {
        await interaction.reply({ content: 'Ditto used Transform!', flags: MessageFlags.Ephemeral });

		const target = interaction.options.getUser('target');
        // Fetch fresh (force) so a renamed member isn't read from a stale cache. Falls back to the
        // member sent with the interaction, then to the user (e.g. they're not in this server).
        let targetInGuild = await interaction.guild.members.fetch({ user: target.id, force: true }).catch(() => null);
        if(!targetInGuild) targetInGuild = interaction.options.getMember('target');
		const message = interaction.options.getString('message');
        const webhooks = await interaction.channel.fetchWebhooks().catch(console.error);
        let webhook = webhooks.find(wh => wh.token);

        if(!webhook) {
            await interaction.channel.createWebhook({
                name: 'Ditto Bot',
                avatar: 'https://i.imgur.com/al4fcuP.png',
            })
            .then(async wh => {
                webhook = wh;
            })
            .catch(console.error);
        }

        await webhook.send({
            content: message,
            // server nickname -> global display name -> username; server avatar -> user avatar
            username: targetInGuild?.displayName ?? target.displayName,
            avatarURL: targetInGuild?.displayAvatarURL?.() ?? target.displayAvatarURL()
        })
        .catch(console.error);
    }
}
