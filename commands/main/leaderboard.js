const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const Model = require('../../schemas/data.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Check the leaderboard!'),
  category,
  async execute(interaction) {
    try {
      const entries = await Model.find({})
        .sort({ ELO: -1 })
        .limit(25)

      const leaderboard = entries.map((entry, index) => {
        return `**${index + 1}**. ${entry.username}: ${entry.ELO} ELO`
      }).join('\n')

      await interaction.reply(`## CURRENT RANKINGS\n${leaderboard || 'No users.'}`)
    } catch (error) {
      console.error(error)
      await interaction.reply(`An error occurred: ${error}`)
    }
  },
}