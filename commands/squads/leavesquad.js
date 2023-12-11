const { SlashCommandBuilder,  ActionRowBuilder, ButtonBuilder, ButtonInteraction } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leavesquad')
    .setDescription('Leave current squad.'),
    category,
    async execute(interaction) {
      const query = {
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      }

      try {
        const userData = await UserModel.findOne(query)

        if (!userData || userData.Squad === 'None') return interaction.reply('You are not in a squad.')

        const squadData = await SquadModel.findOne({ 'members.userId': interaction.user.id })

        if (!squadData) return interaction.reply('Error: Squad not found.')

        const isOwner = squadData.owner === interaction.user.id

        const leaveSquad = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_leave')
            .setLabel('Leave')
            .setStyle(4),
          new ButtonBuilder()
            .setCustomId('cancel_leave')
            .setLabel('Cancel')
            .setStyle(2),
        )

        const deleteSquad = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_delete')
            .setLabel('Delete')
            .setStyle(4),
          new ButtonBuilder()
            .setCustomId('cancel_delete')
            .setLabel('Cancel')
            .setStyle(2),
        )

        await interaction.reply({
          content: `Are you sure you want to ${isOwner ? 'delete' : 'leave'} this squad?`,
          components: [isOwner ? deleteSquad : leaveSquad]
        })

        const filter = (i) => i.isButton()
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

        collector.on('collect', async (buttonInteraction) => {
          const customId = buttonInteraction.customId

          switch (customId) {
            case 'confirm_leave':
              squadData.members = squadData.members.filter(member => member.userId !== interaction.user.id)
              await squadData.save()

              userData.Squad = 'None'
              await userData.save()

              await buttonInteraction.reply(`Left **${squadData.name}**!`)
              break
            case 'cancel_leave':
              await buttonInteraction.reply('Cancelled.')
              break
            case 'confirm_delete':
              await SquadModel.deleteOne({ _id: squadData._id })
              userData.Squad = 'None'
              await userData.save()
              
              await buttonInteraction.reply(`Deleted **${squadData.name}**!`)
              break
            case 'cancel_delete':
              await buttonInteraction.reply('Cancelled.')
              break
          }

          console.log('Stopped collector.')
          collector.stop()
        })

        collector.on('end', (collected, reason) => {
          // console.log(collected)
          if (reason === 'time') {
            interaction.editReply('Button interaction time expired.')

            const disabledSquadRow = isOwner ? deleteSquad : leaveSquad
            disabledSquadRow.components.forEach((component) => {
              component.setDisabled(true)
            })

            interaction.editReply({ components: [disabledSquadRow] })
          } else if (reason === 'user') {
            const disabledSquadRow = isOwner ? deleteSquad : leaveSquad
            disabledSquadRow.components.forEach((component) => {
              component.setDisabled(true)
            })
            
            interaction.editReply({ components: [disabledSquadRow] })
          }
        })
      } catch (error) {
        console.error('Error querying the database: ', error)
        interaction.reply('An error has occurred. See console.')
      }
    }
}