const { SlashCommandBuilder } = require('discord.js')
const Model = require('../../schemas/data.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change nickname.')
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('Name to set.')),
    category,
    async execute(interaction) {
      let username = interaction.options.getString('nickname')
      if (!username) return interaction.reply('Please provide a nickname.')

      const query = {
        userId: interaction.user.id,
        guildId: interaction.guild.id
      }

      try {
        const userData = await Model.findOne(query)

        if (!userData) return interaction.reply('User profile not found. Make sure to create one first!')

        userData.username = username

        await userData.save()

        await interaction.reply(`Successfully change your nickname to: ${username}`)
      } catch (error) {
        console.error('Error updating nickname:', error)
        interaction.reply('An error occurred while updating the nickname.')
      }
    }
}