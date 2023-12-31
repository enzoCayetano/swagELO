const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const Model = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
  .setName('logout')
  .setDescription('[WARNING] Unloads your profile and deletes your data.'),
  category,
  async execute(interaction) {
    const query = {
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    }

    const squadQuery = {
      'members.userId': interaction.user.id,
      guildId: interaction.guild.id,
    }

    try {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_delete')
          .setLabel('Yes')
          .setStyle(3),
        new ButtonBuilder()
          .setCustomId('cancel_delete')
          .setLabel('No')
          .setStyle(4)
      )

      await interaction.reply({
        content: 'Are you sure you want to delete your profile? This action is IRREVERSIBLE.',
        components: [row],
      })

      const filter = (i) => i.customId === 'confirm_delete' || i.customId === 'cancel_delete'
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

      collector.on('collect', async(i) => {
        if (i.user.id === interaction.user.id) {
          if (i.customId === 'confirm_delete') {
            const userData = await Model.findOneAndDelete(query)
            if (!userData) return interaction.reply('No profile found.')
            
            const squad = await SquadModel.findOne(squadQuery)

            if (squad) {
              const isOwner = squad.owner === interaction.user.id
              const isOnlyMember = squad.members.length === 1 && squad.members[0].userId === interaction.user.id

              if (isOwner && isOnlyMember) {
                await SquadModel.findByIdAndDelete(squad._id)
                i.deferUpdate()
                await interaction.followUp('Your profile has been successfully deleted and your squad disbanded.')
              } else {
                const squadUpdate = {
                  $pull: {
                    members: { userId: interaction.user.id },
                  },
                }

                const updatedSquad = await SquadModel.findOneAndUpdate(squadQuery, squadUpdate, { new: true })

                i.deferUpdate()
                await interaction.followUp('Your profile has been successfully deleted and you have left your squad.')
              }
            } else {
              i.deferUpdate()
              await interaction.followUp('Your profile has been successfully deleted.')
            }
          } else {
            i.deferUpdate()
            await interaction.followUp({ content: 'Data wipe canceled.', components: [] })
          }
        }

        collector.stop()
      })

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp({ content: 'Profile deletion command timed out.', ephemeral: true })
        }
      })

    } catch (error) {
      await interaction.reply(`Error logging out: ${error}`)
      console.error('Error grabbing query: ', error)
    }
  }
}