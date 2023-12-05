const { SlashCommandBuilder,  ActionRowBuilder, ButtonBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leavesquad')
    .setDescription('Leave current squad.'),
    category,
    async execute(interaction) {
      const user = interaction.user

      const query = {
        userId: user.id,
        guildId: interaction.user.id,
      }

      try {
        const userData = await UserModel.findOne(query)

        if (!userData || userData.Squad === 'None') return interaction.reply('You are not in a squad.')

        const squadData = await SquadModel.findOne({ 'members.userId': user.id })

        if (!squadData) return interaction.reply('Error: Squad not found.')

        const leaveSquad = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_leave')
            .setLabel('Leave')
            .setStyle(2),
          new ButtonBuilder()
            .setCustomId('cancel_leave')
            .setLabel('Cancel')
            .setStyle(4),
        )

        await interaction.reply({
          content: 'Are you sure you want to leave this squad?',
          components: [leaveSquad]
        })
      } catch (error) {
        console.error('Error querying the database: ', error)
        interaction.reply('An error has occurred. See console.')
      }
    }
}