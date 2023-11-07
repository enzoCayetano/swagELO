const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('updateUser')
        .setDescription('Update specified user ELO + profile.'),
    async execute(interaction) {
        await interaction.reply('Executed.')
    },
}