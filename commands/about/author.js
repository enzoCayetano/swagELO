const { SlashCommandBuilder, MessageMentions: { USERS_PATTERN } } = require('discord.js')
const category = __dirname.split('/').pop()

function getMentionFromUserId(client, userId) {
	const mention = `<@${userId}>`;

	// The id is the first and only match found by the RegEx.
	const matches = mention.matchAll(USERS_PATTERN).next().value;

	// If supplied variable was not a mention, matches will be null instead of an array.
	if (!matches) return;

	// The first element in the matches array will be the entire mention, not just the ID,
	// so use index 0.
	return matches[0];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About this bot!'),
category,
async execute(interaction) {
		await interaction.reply(`This bot was created by <@753118882427830342> for <@1146283177648861184>.`)
	},
}