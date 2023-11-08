const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Check the leaderboard!'),
    category,
    async execute(interaction) {
        await interaction.reply('Test')
    },
}