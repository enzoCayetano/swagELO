const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
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

        if (!allSquads || allSquads.length === 0) {
          const embed = new EmbedBuilder()
            .setColor(0x8B0000)
            .setTitle('No Squads')
            .setDescription('There are no squads.')
        }

        const squadList = allSquads.map((squad) => {
          const memberList = squad.members.map((member) => `${member.username}`).join(', ')
          const description = squad.description || 'No description available.'

          const embed = new EmbedBuilder()
            .setColor(0x8B0000)
            .setTitle(`${squad.name}`)
            .addFields(
              { name: "Squad Description", value: description },
              { name: "Combined Squad ELO", value: squad.overallELO + "" },
              { name: "Leader", value: `Leader: <@${squad.owner}>` },
              { name: "Members", value: memberList || 'No members.' }
            )

          return embed;
        })

        interaction.reply({ embeds: squadList })
      } catch (error) {
        console.error('Error listing squads:', error)
        interaction.reply('An error occurred while listing squads.')
      }
    } 
}