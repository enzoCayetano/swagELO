const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('About this server!'),
    category,
    async execute(interaction) {
        await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`)
    },
}