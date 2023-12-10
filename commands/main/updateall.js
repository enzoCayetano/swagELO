const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/user.js');
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder() 
    .setName('updateall')
    .setDescription('Update all users.'),
    category,
    async execute(interaction) {
      // ELO vars
      let eloGainOnWin = 30
      let eloLossOnLose = 18
      let eloGainOnKill = 15
      let eloLossOnDeath = 13
      let eloGainOnMVP = 9

      const members = Array.from(interaction.guild.members.cache.values())

      let query

      for (const member of members) {
        if (!member.user.bot) {
          query = {
            userId: member.user.id,
            guildId: interaction.guild.id,
          }
        }

        try {
          const userData = await Model.findOne(query)

          if (userData && userData.NeedsUpdate) {
            // CALCULATE KDR, ELO, AND RANK

            // Calculate KDR (bunch of checks cus ts wasn't working)
            if (userData.Kills != 0 && userData.Deaths != 0)
            userData.KDR = parseFloat((userData.Kills / userData.Deaths).toFixed(2))

            if (isNaN(userData.KDR)) {
              console.log(userData.KDR)
              userData.KDR = 0
            }

            if (isNaN(userData.ELO)) {
              console.log(userData.ELO)
              userData.ELO = 0
            }

            let eloWin = 0
            let eloKill = 0
            let eloMVP = 0
            let eloLose = 0
            let eloDeath = 0

            eloWin = userData.Wins * eloGainOnWin
            eloKill = userData.Kills * eloGainOnKill
            eloMVP = userData.MVP * eloGainOnMVP
            eloLose = userData.Losses * eloLossOnLose
            eloDeath = userData.Deaths * eloLossOnDeath

            // #gains-losses
            let previousELO = userData.ELO
            userData.ELO = eloWin + eloKill + eloMVP - eloLose - eloDeath
            let eloChange = userData.ELO - previousELO

            const gainEloEmbed = new EmbedBuilder()
              .setColor('#00FF00') // Green color
              .addFields({ name: 'ELO Change', value: `😍 <@${userData.userId}> gained **${eloChange} ELO!**` })
            const loseEloEmbed = new EmbedBuilder()
              .setColor('#FF0000') // Red color
              .addFields({ name: 'ELO Change', value: `💔 <@${userData.userId}> lost **${Math.abs(eloChange)} ELO!**` })

            if (eloChange > 0) {
              await sendMessageToChannel('1175705395751305217', interaction, gainEloEmbed);  
              userData.LastMatch = `+${eloChange}`
            } else if (eloChange < 0) {
              await sendMessageToChannel('1175705395751305217', interaction, loseEloEmbed);  
              userData.LastMatch = `${eloChange}`
            }

            if (userData.ELO < 0) userData.ELO = 0 // NEGATIVE ELO NO MORE

            // Get roles
            const roles = {
              'S': interaction.guild.roles.cache.find(role => role.name === 'S'),
              'A+': interaction.guild.roles.cache.find(role => role.name === 'A+'),
              'A-': interaction.guild.roles.cache.find(role => role.name === 'A-'),
              'B+': interaction.guild.roles.cache.find(role => role.name === 'B+'),
              'B-': interaction.guild.roles.cache.find(role => role.name === 'B-'),
              'C+': interaction.guild.roles.cache.find(role => role.name === 'C+'),
              'C-': interaction.guild.roles.cache.find(role => role.name === 'C-'),
              'D+': interaction.guild.roles.cache.find(role => role.name === 'D+'),
              'D-': interaction.guild.roles.cache.find(role => role.name === 'D-'),
              'F+': interaction.guild.roles.cache.find(role => role.name === 'F+'),
              'F-': interaction.guild.roles.cache.find(role => role.name === 'F-'),
            }
            
            // Calculate RANK
            if (userData.ELO >= 6000)
              userData.Rank = 'S'
            else if (userData.ELO > 5000)
              userData.Rank = 'A+'
            else if (userData.ELO > 4500)
              userData.Rank = 'A-'
            else if (userData.ELO > 4000)
              userData.Rank = 'B+'
            else if (userData.ELO > 3500)
              userData.Rank = 'B-'
            else if (userData.ELO > 3000)
              userData.Rank = 'C+'
            else if (userData.ELO > 2500)
              userData.Rank = 'C-'
            else if (userData.ELO > 2000)
              userData.Rank = 'D+'
            else if (userData.ELO > 1500)
              userData.Rank = 'D-'
            else if (userData.ELO > 1000)
              userData.Rank = 'F+'
            else if (userData.ELO > 500)
              userData.Rank = 'F-'
            else
              userData.Rank = 'N' // NON RANKED

            Object.values(roles).forEach((role) => {
              const member = interaction.guild.members.cache.get(userData.userId)
            
              if (member && member.roles.cache.has(role.id)) {
                member.roles.remove(role)
                  .then(() => console.log(`Removed role ${role.name} from ${userData.username}`))
                  .catch(error => console.error('Error removing role: ', error))
              }
            })
              
            const roleToAdd = roles[userData.Rank]

            if (roleToAdd) {
              const member = interaction.guild.members.cache.get(userData.userId)

              if (member) {
                if (!member.roles.cache.has(roleToAdd.id)) {
                  member.roles.add(roleToAdd)
                    .then(() => console.log(`Added role ${roleToAdd.name} to ${userData.username}`))
                    .catch(error => console.error('Error adding role: ', error))
                } else {
                  console.log(`${userData.username} already has the role ${roleToAdd.name}`)
                }
              } else {
                console.error('Member not found.')
              }
            } else {
              console.error('Role not found for current rank.')
            }

            
            let updatedNick = ""
            const existingSquad = await SquadModel.findOne({ 'members.userId': member.user.id })
            if (!existingSquad) 
              updatedNick = `[${userData.ELO} ELO] ${userData.username}`
            else
              updatedNick = `[${userData.ELO} ELO] ${existingSquad.tag.toUpperCase()} ${userData.username}`

            if (member.manageable) {
              await member.setNickname(updatedNick)
              .then(() => {
                console.log(`Successfully set nickname ${member.user.tag} for ${userData.username}`)
              })
              .catch(error => {
                console.error('Error setting nickname: ', error)
              })
            } else {
              console.log(`Bot does not have permission to set nickname for ${member.user.tag}`)
            }

            userData.NeedsUpdate = false
            await userData.save()
            console.log(`Updated profile for ${member.user.tag}`)
          }
        } catch (error) {
          console.error('Error querying the database.', error)
        }
      }

      async function sendMessageToChannel(channelId, interaction, embed) {
        try {
          const channel = await interaction.client.channels.fetch(channelId);
          await channel.send({ embeds: [embed] });
        } catch (error) {
          console.error(`Error sending message to channel: ${error}`);
        }
      }
    }
}