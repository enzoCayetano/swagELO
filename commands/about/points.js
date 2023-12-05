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
      .addFields(
        { name: 'Wins', value: '+30', inline: true },
        { name: 'Loss', value: '-18', inline: true },
        { name: 'Kills', value: '+15', inline: true },
        { name: 'Death', value: '-13', inline: true },
        { name: 'MVP', value: '+9', inline: true },
      )
		await interaction.reply({ embeds: [points] })
	}
}