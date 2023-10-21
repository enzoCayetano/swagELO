const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile, ELO, etc.'),
    async execute(interaction) {
        await interaction.reply('Checked profile!')
    },
}