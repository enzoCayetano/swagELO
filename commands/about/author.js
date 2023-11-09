const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('About this bot!'),
category,
async execute(interaction) {
		await interaction.reply('This bot was created by swigger for daddy acid.')
	},
}