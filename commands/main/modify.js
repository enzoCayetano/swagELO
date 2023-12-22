const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const category = __dirname.split('/').pop();
const Model = require('../../schemas/user.js');
const SquadModel = require('../../schemas/squad.js');

// TODO
/*
 * Changed user.js ✅
 * Switch to JSON handling for modifications ✅
 * Accomodate those changes ❌
 * ^ Change profile.js and modify.js to check for handling ranked or unranked data
 * Do the same for updateall probably
 * Also check the same for squads
*/

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('modify')
    .setDescription('Modify player\'s data using a JSON file.')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('Upload a JSON file with modifications.')
        .setRequired(true)),
  category,
  async execute(interaction) {
    const receivedFile = interaction.options.getAttachment('file');

    try {
      const response = await fetch(receivedFile.url)
      if (!response.ok) throw new Error(`Error fetching the file: ${response.statusText}`)
      
      const rawData = await response.text()
      const playerModifications = JSON.parse(rawData)

      const gamemode = playerModifications.gamemode || "Unranked" // defaults to Unranked
      const receivedData = playerModifications.modifications || []

      const modificationsSummary = []

      for (const playerModification of receivedData) {
        const targetUser = interaction.guild.members.cache.get(playerModification.userId)

        if (!targetUser) {
          console.error(`User not found for ID: ${playerModification.userId}`)
          continue
        }
        
        const userData = await Model.findOne({ userId: playerModification.userId, guildId: interaction.guild.id })
        
        if (!userData) {
          console.error(`User data not found for ID: ${playerModification.userId}`)
          continue
        }

        const modifications = playerModification

        if (gamemode === 'Ranked') {
          userData.Ranked.Kills += modifications.kills || 0
          userData.Ranked.Deaths += modifications.deaths || 0
          userData.Ranked.Wins += modifications.wins || 0
          userData.Ranked.Losses += modifications.losses || 0
          userData.Ranked.MVP += modifications.mvp || 0
        } else if (gamemode === 'Unranked') {
          userData.Unranked.Kills += modifications.kills || 0
          userData.Unranked.Deaths += modifications.deaths || 0
          userData.Unranked.Wins += modifications.wins || 0
          userData.Unranked.Losses += modifications.losses || 0
          userData.Unranked.MVP += modifications.mvp || 0
        } else {
          console.log('ERROR: Invalid gamemode.')
        }

        // Also add LastMatch

        const userChanges = {
          userId: userData.userId,
          username: userData.username,
          kills: modifications.kills || 0,
          deaths: modifications.deaths || 0,
          wins: modifications.wins || 0,
          losses: modifications.losses || 0,
          mvp: modifications.mvp || 0,
        }

        modificationsSummary.push(userChanges)
      }

      const embedChanges = new EmbedBuilder()
        .setColor(0x8B0000)
        .setTitle('Pending Stat Changes')
        .setDescription(`Gamemode: ${gamemode}`)

      for (const userChanges of modificationsSummary) {
        embedChanges.addFields(
          { name: 'User', value: `<@${userChanges.userId}>` },
          { name: 'Kills', value: userChanges.kills.toString(), inline: true },
          { name: '\u200B', value: '\u200B', inline: true }, // Empty field for whitespace
          { name: 'Deaths', value: userChanges.deaths.toString(), inline: true },
          { name: 'Wins', value: userChanges.wins.toString(), inline: true },
          { name: '\u200B', value: '\u200B', inline: true }, // Empty field for whitespace
          { name: 'Losses', value: userChanges.losses.toString(), inline: true },
          { name: 'MVPs', value: userChanges.mvp.toString(), inline: true },
        )
      }

      const confirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_changes')
          .setLabel('Confirm')
          .setStyle(3),
        new ButtonBuilder()
          .setCustomId('cancel_changes')
          .setLabel('Cancel')
          .setStyle(2),
      )

      await interaction.reply({ embeds: [embedChanges], components: [confirm] })

      const filter = (i) => i.customId === 'confirm_changes' || i.customId === 'cancel_changes'
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })

      collector.on('collect', async (buttonInteraction) => {
        try {
          if (buttonInteraction.customId === 'confirm_changes') {
            for (const playerModification of receivedData) {
              const targetUser = interaction.guild.members.cache.get(playerModification.userId)

              if (!targetUser) {
                console.error(`User not found for ID: ${playerModification.userId}`);
                continue
              }

              const userData = await Model.findOne({ userId: playerModification.userId, guildId: interaction.guild.id })

              if (!userData) {
                console.error(`User data not found for ID: ${playerModification.userId}`)
                continue
              }

              if (gamemode === 'Ranked') {
                userData.Ranked.Kills += playerModification.kills || 0
                userData.Ranked.Deaths += playerModification.deaths || 0
                userData.Ranked.Wins += playerModification.wins || 0
                userData.Ranked.Losses += playerModification.losses || 0
                userData.Ranked.MVP += playerModification.mvp || 0
              } else if (gamemode === 'Unranked') {
                userData.Unranked.Kills += playerModification.kills || 0
                userData.Unranked.Deaths += playerModification.deaths || 0
                userData.Unranked.Wins += playerModification.wins || 0
                userData.Unranked.Losses += playerModification.losses || 0
                userData.Unranked.MVP += playerModification.mvp || 0
              } else {
                console.log('ERROR: Invalid gamemode.')
              }

              await userData.save()
              console.log(userData)

              // Set nickname
              let updatedNick = ""
              const existingSquad = await SquadModel.findOne({ 'members.userId': targetUser.id })
              if (!existingSquad)
                updatedNick = `${userData.username}`
              else
                updatedNick = `${existingSquad.tag.toUpperCase()} ${userData.username}`
        
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
            }

            await buttonInteraction.reply('Changes saved!')
          } else if (buttonInteraction.customId === 'cancel_changes') {
            await buttonInteraction.reply('Modify cancelled.')
          }
        } catch (error) {
          console.error('Error during collection handling', error)
        } finally {
          collector.stop()
          confirm.components.forEach((component) => {
            component.setDisabled(true)
          })

          interaction.editReply({ components: [confirm] })
        }
      })

      collector.on('end', (collected, reason) => {
        confirm.components.forEach((component) => {
          component.setDisabled(true)
        })

        interaction.editReply({ components: [confirm] })

        if (reason === 'time') {
          interaction.followUp({ content: 'Collection timed out.', ephemeral: true })
        }
      })
    } catch (error) {
      console.error('Error handling the file:', error)
    }
  }
} 

