const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Check your current profile.'),
    async execute(interaction) {
        await interaction.reply('Checked profile!')
    },
}