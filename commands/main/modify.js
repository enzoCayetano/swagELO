const { SlashCommandBuilder } = require('discord.js')
const global = require('../../globalvars.js')
const model = require('../../schemas/data.js')
const category = __dirname.split('/').pop()

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('modify')
    .setDescription('Modify user data. [HOST ONLY]')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Which user to modify.')
        .setRequired(true)),
  category,
  async execute(interaction) {
    // Check if required role is within user
    const requiredRole = interaction.guild.roles.cache.find(role => role.name === global._HOSTROLE)

    if (!requiredRole || !interaction.member.roles.cache.has(requiredRole.id))
      return interaction.reply({ content: 'You do not have access to this command.', ephemeral: true })

    return interaction.reply('Test!')
  }
}