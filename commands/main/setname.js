const { SlashCommandBuilder } = require('discord.js')
const Model = require('../../schemas/user.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnickname')
    .setDescription('[ADMIN ONLY] Forcefully re-nickname a player.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Which player'))
    .addStringOption(option => 
      option.setName('nickname')
        .setDescription('New nickname')),
  category,
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user')
    const newNick = interaction.options.getString('nickname')
    if (!newNick) return interaction.reply('Please provide a nickname.')

    const query = {
      userId: targetUser.id,
      guildId: interaction.guild.id,
    }

    try {
      const userData = await Model.findOne(query)

      if (!userData) return interaction.reply('User profile not found.')

      userData.username = newNick

      await userData.save()

      // Set nickname
      const updatedNick = `[${userData.ELO} ELO] ${userData.username}`

      const nickMember = interaction.guild.members.cache.get(targetUser.id)

      if (nickMember) {
        await nickMember.setNickname(updatedNick)
          .then(() => {
            console.log(`Successfully set nickname ${nickMember} for ${userData.username}`)
          })
          .catch(error => {
            console.error('Error setting username: ', error)
          })
      } else {
        console.log('Member not found.')
      }

      await interaction.reply(`Successfully changed ${targetUser}'s nickname!`)
    } catch (error) {
      console.error('Error occurred while setting name', error)
      interaction.reply(`An error occurred: ${error}`)
    }
  }
}