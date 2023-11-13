const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const global = require('../../roles.js')
const category = __dirname.split('/').pop()
const Model = require('../../schemas/data.js')

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

    // Get user from userOption
    const targetUser = interaction.options.getUser('user')

    // Query for user in db
    const query = {
        userId: targetUser.id,
        guildId: interaction.guild.id,
    }

    try {
      const userData = await Model.findOne(query)

      // User profile dne
      if (!userData) return interaction.reply('This user does not have an existing profile to modify!')

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('give_kills')
          .setLabel('Add Kill')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('remove_kills')
          .setLabel('Remove Kill')
          .setStyle(2),
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId('add_deaths')
        .setLabel('Add Death')
        .setStyle(1),
        new ButtonBuilder()
          .setCustomId('remove_deaths')
          .setLabel('Remove Death')
          .setStyle(2),
      )

      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('add_mvp')
          .setLabel('Add MVP')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('remove_mvp')
          .setLabel('Remove MVP')
          .setStyle(2)
      )

      const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('finishModify')
          .setLabel('Finish')
          .setStyle('3'),
      )

      await interaction.reply({ content: `Modify user: ${userData.username}`, components: [row1, row2, row3, row4] })

      const filter = i => {
        return i.customId.startsWith('give_kills') ||
               i.customId.startsWith('remove_kills') ||
               i.customId.startsWith('add_deaths') ||
               i.customId.startsWith('remove_deaths') ||
               i.customId.startsWith('add_mvp') ||
               i.customId.startsWith('remove_mvp') ||
               i.customId.startsWith('finishModify')
      }

      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 }) // 1 minute before timeout

      collector.on('collect', async i => {
        const { customId } = i

        // Handle each button interaction based on customId
        if (customId.startsWith('give_kills')) {
          userData.Kills += 1
        } else if (customId.startsWith('remove_kills')) {
          userData.Kills -= 1
        } else if (customId.startsWith('add_deaths')) {
          userData.Deaths += 1
        } else if (customId.startsWith('remove_deaths')) {
          userData.Deaths -= 1
        } else if (customId.startsWith('add_mvp')) {
          userData.MVP += 1
        } else if (customId.startsWith('remove_mvp')) {
          userData.MVP -= 1
        } else if (customId.startsWith('finishModify')) {
          try {
            await i.deferUpdate()
            await userData.save()
            collector.stop('finished') // Stop the collector
          } catch (saveError) {
            console.error('Error saving user data', saveError)
            if (!interaction.replied)
              interaction.reply('An error occurred while saving data.')
          }
        }
      })

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          // Handle the case where the collector times out
          if (!interaction.replied)
            interaction.reply('Modification timed out.')
        } else if (reason === 'finished') {
          if (!interaction.replied)
            interaction.reply(`Finished modifying ${userData.username}`)
        }
      })

    } catch (error) {
      console.log(`Error: `, error)
      await interaction.reply('An error occurred. Check the console log for details.')
    }
  }
};
