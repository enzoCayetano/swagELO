const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('List points!'),
category,
async execute(interaction) {
    const points = new EmbedBuilder()
      .setColor(0x8B0000)
      .setTitle('Current ELO Points Awarded')
      .addFields({
        name: 'Wins', value: '25',
        name: 'Loss', value: '-12',
        name: 'Kills', value: '10',
        name: 'Death', value: '-8',
        name: 'MVP', value: '9',
      })
		await interaction.reply({ embeds: [points] })
	}
}