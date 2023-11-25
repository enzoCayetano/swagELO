const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listsquads')
    .setDescription('List all squads and their members.'),
    category,
    async execute(interaction) {
      try {
        const allSquads = await SquadModel.find()

        if (!allSquads || allSquads.length === 0) return interaction.reply('There are no squads.')

        const squadList = allSquads.map((squad) => {
          const memberList = squad.members.map((member) => `${member.username}`).join(', ')
          const description = squad.description || 'No description available.'
          return `**${squad.name}**: ${description}\nMembers: ${memberList || 'No members.'}`
        })

        const response = `List of squads:\n${squadList.join('\n\n')}`
        interaction.reply(response)
      } catch (error) {
        console.error('Error listing squads:', error)
        interaction.reply('An error occurred while listing squads.')
      }
    } 
}