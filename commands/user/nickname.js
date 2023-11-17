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

        // Set nickname
        const updatedNick = `[${userData.ELO} ELO] ${userData.username}`

        const nickMember = interaction.guild.members.cache.get(interaction.user.id)

        if (nickMember) {
          await nickMember.setNickname(updatedNick)
            .then(() => {
              console.log(`Successfully set nickname ${nickMember} for ${targetUser.username}`)
            })
            .catch(error => {
              console.error('Error setting username: ', error)
            })
        } else {
          console.log('Member not found.')
        }

        await interaction.reply(`Successfully changed your nickname to: ${username}`)
      } catch (error) {
        console.error('Error updating nickname:', error)
        interaction.reply('An error occurred while updating the nickname.')
      }
    }
}