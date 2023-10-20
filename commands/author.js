const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About this bot!'),
    async execute(interaction) {
        await interaction.reply('About me!')
    },
};