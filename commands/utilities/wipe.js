const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder,  } = require('discord.js')
const Model = require('../../schemas/data.js')
const global = require('../../roles.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wipe')
    .setDescription('Wipe all data. WARNING: IRREVERSIBLE. Admins only.'),
    category,
    async execute(interaction) {
      let adminRole = interaction.guild.roles.cache.find(r => r.name === global.ADMINROLE) || await interaction.guild.roles.fetch(global.ADMINROLE)
      if (!adminRole)
        return interaction.reply({ content: `You do not have access to this command. Only ${global.ADMINROLE}s can use this command.`, ephemeral: true })

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_wipe')
          .setLabel('Confirm')
          .setStyle(3),
        new ButtonBuilder()
          .setCustomId('cancel_wipe')
          .setLabel('Cancel')
          .setStyle(4),
      )
      
      await interaction.reply({
        content: 'Are you sure want to wipe all data? This action is IRREVERSIBLE.',
        components: [row],
      })

      const filter = (i) => i.customId === 'confirm_wipe' || i.customId === 'cancel_wipe'
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

      collector.on('collect', async(i) => {
        if (i.user.id === interaction.user.id) {
          if (i.customId === 'confirm_wipe') {
            await Model.deleteMany()
            await interaction.editReply({ content: 'Data wipe successful.', components: [] })
          } else {
            await interaction.editReply({ content: 'Data wipe canceled.', components: [] })
          }
        }

        collector.stop()
      })

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp({ content: 'Data wipe command timed out.', ephemeral: true })
        }
      })
    }
}