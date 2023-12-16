const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const global = require('../../roles.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/user.js');
const SquadModel = require('../../schemas/squad.js');

// TODO
/*
 * Changed user.js
 * Accomodate those changes
 * Switch to JSON handling for modifications
*/

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('modify')
    .setDescription('Modify user data. [HOST ONLY]')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Which user to modify.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('kills')
        .setDescription('Set kills.'))
    .addStringOption(option =>
      option.setName('deaths')
        .setDescription('Set deaths.'))
    .addStringOption(option =>
      option.setName('wins')
        .setDescription('Set wins.'))
    .addStringOption(option =>
      option.setName('losses')
        .setDescription('Set losses.'))
    .addStringOption(option =>
      option.setName('mvp')
        .setDescription('Set MVPs.')),
  category,
  async execute(interaction) {
    let hostRole = interaction.guild.roles.cache.find(r => r.name === global.HOSTROLE) || await interaction.guild.roles.fetch(global.HOSTROLE)
    if (!hostRole)
        return interaction.reply({ content: `You do not have access to this command. Only ${global.HOSTROLE}s can use this command.`, ephemeral: true })

    // Get all option data from userOption
    const targetUser = interaction.options.getUser('user')
    let setKills = interaction.options.getString('kills')
    let setDeaths = interaction.options.getString('deaths')
    let setWins = interaction.options.getString('wins')
    let setLosses = interaction.options.getString('losses')
    let setMVPs = interaction.options.getString('mvp')

    // parse for +/-
    const handlePlusMinus = (input, currentValue) => {
      if (typeof input === 'string' && input.trim() !== '') {
        const operator = input.charAt(0)
        const value = parseInt(input.slice(1))
        
        if (!isNaN(value) && (operator === '+' || operator === '-')) {
          return operator === '+' ? currentValue + value : currentValue - value
        } else if (!isNaN(input)) {
          return parseInt(input)
        }
      }
      
      return currentValue
    }

    // Query for user in db
    const query = {
        userId: targetUser.id,
        guildId: interaction.guild.id,
    }

    try {
      const userData = await Model.findOne(query)
            
      if (!userData) return interaction.reply('This user does not have an existing profile!')

      const formerKills = userData.Kills
      const formerDeaths = userData.Deaths
      const formerWins = userData.Wins
      const formerLosses = userData.Losses
      const formerMVPs = userData.MVP

      if (setKills !== undefined) {
        setKills = handlePlusMinus(setKills, userData.Kills)
        userData.Kills = setKills;
      }
      if (setDeaths !== undefined) {
        setDeaths = handlePlusMinus(setDeaths, userData.Deaths)
        userData.Deaths = setDeaths
      }
      if (setWins !== undefined) {
        setWins = handlePlusMinus(setWins, userData.Wins)
        userData.Wins = setWins
      }
      if (setLosses !== undefined) {
        setLosses = handlePlusMinus(setLosses, userData.Losses)
        userData.Losses = setLosses
      }
      if (setMVPs !== undefined) {
        setMVPs = handlePlusMinus(setMVPs, userData.MVP)
        userData.MVP = setMVPs
      }

      const embedChanges = new EmbedBuilder()
      .setColor(0x8B0000)
      .setTitle('Pending Stat Changes')
      .addFields(
        { name: 'User', value: userData.username },
        { name: 'Kills', value: (userData.Kills !== formerKills) ? `${formerKills.toString()} => ${userData.Kills.toString()} ✅` : formerKills.toString(), inline: true },
        { name: 'Deaths', value: (userData.Deaths !== formerDeaths) ? `${formerDeaths.toString()} => ${userData.Deaths.toString()} ✅` : formerDeaths.toString(), inline: true },
        { name: '\u200B', value: '\u200B', inline: true }, // Empty field for whitespace
        { name: 'Wins', value: (userData.Wins !== formerWins) ? `${formerWins.toString()} => ${userData.Wins.toString()} ✅` : formerWins.toString(), inline: true },
        { name: 'Losses', value: (userData.Losses !== formerLosses) ? `${formerLosses.toString()} => ${userData.Losses.toString()} ✅` : formerLosses.toString(), inline: true },
        { name: '\u200B', value: '\u200B', inline: true }, // Empty field for whitespace
        { name: 'MVPs', value: (userData.MVP !== formerMVPs) ? `${formerMVPs.toString()} => ${userData.MVP.toString()} ✅` : formerMVPs.toString(), inline: true }
      )

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
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })

      collector.on('collect', async (i) => {
        try {
          if (i.customId === 'confirm_changes') {
            userData.NeedsUpdate = true
            await userData.save()
      
            // Set nickname
            let updatedNick = ""
            const existingSquad = await SquadModel.findOne({ 'members.userId': targetUser.id })
            if (!existingSquad)
              updatedNick = `[${userData.ELO} ELO] ${userData.username}`
            else
              updatedNick = `[${existingSquad.tag}][${userData.ELO} ELO] ${userData.username}`
      
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

            await i.reply('Changes saved!')
          } else if (i.customId === 'cancel_changes') {
            await i.reply('Modify cancelled.')
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

        collector.on('end', (collected, reason) => {
          confirm.components.forEach((component) => {
            component.setDisabled(true)
          })

          i.editReply({ components: [confirm] })

          if (reason === 'time') {
            interaction.followUp({ content: 'Collection timed out.', ephemeral: true })
          }
        })
      })
    } catch (error) {
      console.error('Error querying the database.', error)
      await interaction.reply(`An error occurred: ${error}`)
    }
  }
} 

