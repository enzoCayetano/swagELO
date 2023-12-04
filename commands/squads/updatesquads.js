const { SlashCommandBuilder } = require('discord.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/user.js');
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder() 
    .setName('updatesquads')
    .setDescription('Update all squads.'),
    category,
    async execute(interaction) {
      const allSquads = await SquadModel.find()
      
      for (const squad of allSquads) {
        let totalElo = 0
        
        for (const member of squad.members) {
          const userData = await Model.findOne({
            userId: member.userId,
            guildId: interaction.guild.id,
          })

          if (userData) {
            totalElo += userData.ELO
          }
        }

        squad.overallELO = totalElo
        await squad.save()
      }
      await interaction.reply('Updated all squads.')
    }
}