const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')

/*
 * TODO
 * Test basically
*/

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startunranked')
    .setDescription('Start an unranked match.'),
  category,
  async execute(interaction) {
    try {
      const awaitingMatchChannel = interaction.guild.channels.cache.get('1174508685502984332')

      // Check if users are in
      if (!awaitingMatchChannel || awaitingMatchChannel.members.size === 0) {
        return interaction.reply('There are no users in the "Awaiting Match" channel.')
      }

      const usersAwaiting = await Promise.all(
        awaitingMatchChannel.members.map(async (member) => ({
          user: member.user,
          elo: await getUserELO(member.user.id),
        }))
      )

      const sortedUsers = usersAwaiting.sort((a, b) => b.elo - a.elo)

      const team1 = []
      const team2 = []

      sortedUsers.forEach((user, index) => {
        if (index % 2 === 0) {
          team1.push(user)
        } else {
          team2.push(user)
        }
      })

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start_match')
          .setLabel('Start Match')
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId('cancel_match')
          .setLabel('Cancel')
          .setStyle(4)
      )

      await interaction.reply({
        content: `# Unranked Match\n**Team 1:** <@${team1.map(user => `${user.user.id}> (ELO: ${user.elo})`).join(', ')}\n**Team 2:** ${team2.map(user => `${user.user.tag} (ELO: ${user.elo})`).join(', ')}`,
        components: [actionRow]
      })

      const filter = i => i.customId === 'start_match' || i.customId === 'cancel_match'
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 }); // 30 seconds timeout

      collector.on('collect', async i => {
        try {
          if (i.customId === 'start_match') {
            await handleStartMatch(i, team1, team2)
          } else if (i.customId === 'cancel_match') {
            i.reply('Host cancelled match.')
          }
        } catch (error) {
          console.error('Error during interaction collection:', error)
        }

        collector.stop()
      })

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp({ content: 'Start Unranked command timed out.', ephemeral: true })

          const disabledActionRow = actionRow
          disabledActionRow.components.forEach((component) => {
            component.setDisabled(true)
          })

          interaction.editReply({ components: [disabledActionRow] })
        } else if (reason === 'user') {
          const disabledActionRow = actionRow
          disabledActionRow.components.forEach((component) => {
            component.setDisabled(true)
          })

          interaction.editReply({ components: [disabledActionRow] })
        }
      })
    } catch (error) {
      console.error('An error occurred trying to start an unranked match:', error)
      interaction.reply('An error occurred while trying to start the unranked match.')
    }
  }
}

async function getUserELO(userId) {
  try {
    const user = await UserModel.findOne({ userId })
    return user ? user.ELO : 0
  } catch (error) {
    console.error('Error fetching user ELO:', error)
    return 0;
  }
}

async function handleStartMatch(interaction, team1, team2) {
  try {
    await interaction.deferReply()

    const team1VoiceChannelId = '1174386628123443241'
    const team2VoiceChannelId = '1174386645953421382'

    const team1VoiceChannel = interaction.guild.channels.cache.get(team1VoiceChannelId)
    const team2VoiceChannel = interaction.guild.channels.cache.get(team2VoiceChannelId)

    await moveMembersToChannel(team1, team1VoiceChannel)
    await moveMembersToChannel(team2, team2VoiceChannel)

    interaction.followUp('Match started! Teams have been moved to their respective voice channels.')
  } catch (error) {
    console.error('Error during start match:', error)
    interaction.followUp('An error occurred while starting the match.')
  }
}

async function moveMembersToChannel(team, voiceChannel) {
  try {
    for (const user of team) {
      const member = await voiceChannel.guild.members.fetch(user.user.id)
      await member.voice.setChannel(voiceChannel)
    }
  } catch (error) {
    console.error('Error moving members to channel: ', error)
  }
}