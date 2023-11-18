const { SlashCommandBuilder } = require('discord.js');
const global = require('../../roles.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/data.js');

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

    // ELO vars
    let eloGainOnWin = 125
    let eloGainOnKill = 50
    let eloGainOnMVP = 90
    let eloLossOnLose = 60
    let eloLossOnDeath = 20

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

      // Calculate ELO
      if (userData.ELO >= 6000) {
        eloGainOnWin = 60
        eloGainOnKill = 30
        eloGainOnMVP = 50
        eloLossOnLose = 20
        eloLossOnDeath = 10
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

      userData.ELO = eloWin + eloKill + eloMVP - eloLose - eloDeath

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

      const roleToAdd = roles[userData.Rank]

      if (roleToAdd) {
        const member = interaction.guild.members.cache.get(userData.userId)

        if (member) {
          member.roles.add(roleToAdd)
            .then(() => console.log(`Added role ${roleToAdd.name} to ${userData.username}`))
            .catch(error => console.error('Error adding role: ', error))
        } else {
          console.error('Member not found.')
        }
      } else {
        console.error('Role not found for current rank.')
      }

      await userData.save()
      interaction.followUp('Calculating KDR, ELO & RANK. Saved to database.')

      // Set nickname
      const updatedNick = `[${userData.ELO} ELO] ${userData.username}`

      const nickMember = interaction.guild.members.cache.get(targetUser.id)

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

    } catch (error) {
      console.error('Error querying the database.', error)
      await interaction.reply(`An error occurred: ${error}`)
    }
  }
} 