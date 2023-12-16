const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startranked')
    .setDescription('Start a ranked match.'),
    category,
    async execute(interaction) {
      // TODO
    }
}