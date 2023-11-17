const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scramble')
    .setDescription('Scramble ALL users in \'Awaiting Match\' voice channel.'),
  category,
  async execute(interaction) {
    const voiceChannelId = '1174508685502984332'
    const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId)

    const team1Channel = interaction.guild.channels.cache.get('1174386628123443241')
    const team2Channel = interaction.guild.channels.cache.get('1174386645953421382')

    if (voiceChannel) {
      const voiceStates = voiceChannel.members
      const userIds = voiceStates.map((voiceState) => voiceState.id)

      console.log(`User IDs in voice channel: ${userIds.join(', ')}`)

      for (let i = userIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [userIds[i], userIds[j]] = [userIds[j], userIds[i]]
      }

      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i]
        const user = voiceChannel.members.get(userId)

        if (user) {
          const targetChannel = i % 2 === 0 ? team1Channel : team2Channel

          await user.voice.setChannel(targetChannel)
        }
      }

      await interaction.reply('Users in channel scrambled!')
    } else {
      console.log('Invalid voice channel.')
    }


  }
}