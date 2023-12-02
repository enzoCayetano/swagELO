const { SlashCommandBuilder } = require('discord.js');
const global = require('../../roles.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/user.js');
const SquadModel = require('../../schemas/squad.js');

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

      await interaction.reply(`Changed ${userData.username}'s STATS:
                Kills: ${(userData.Kills !== formerKills) ? `${formerKills} => ${userData.Kills}` : formerKills}
                Deaths: ${(userData.Deaths !== formerDeaths) ? `${formerDeaths} => ${userData.Deaths}` : formerDeaths}
                Wins: ${(userData.Wins !== formerWins) ? `${formerWins} => ${userData.Wins}` : formerWins}
                Losses: ${(userData.Losses !== formerLosses) ? `${formerLosses} => ${userData.Losses}` : formerLosses}
                MVP: ${(userData.MVP !== formerMVPs) ? `${formerMVPs} => ${userData.MVP}` : formerMVPs}`)

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

    } catch (error) {
      console.error('Error querying the database.', error)
      await interaction.reply(`An error occurred: ${error}`)
    }
  }
} 

