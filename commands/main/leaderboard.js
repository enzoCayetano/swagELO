const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Check the leaderboard!'),
    async execute(interaction) {
        await interaction.reply('Test')
    },
}