const { Client, Collection, Events, GatewayIntentBits, ActivityType, MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const config = {
    token: process.env.TOKEN
};

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if('data' in command && 'execute' in command)client.commands.set(command.data.name, command);
	else console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
}


client.once(Events.ClientReady, () => {
    console.log('Bot is online');
    client.user.setPresence({
        activities: [{ name: 'with Misty', type: ActivityType.Playing }],
        status: 'online',
    });
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		const reply = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };
		if (interaction.replied || interaction.deferred) await interaction.followUp(reply).catch(console.error);
		else await interaction.reply(reply).catch(console.error);
	}
});



client.login(config.token);