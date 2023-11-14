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
    .addIntegerOption(option =>
      option.setName('kills')
        .setDescription('Set kills.'))
    .addIntegerOption(option =>
      option.setName('deaths')
        .setDescription('Set deaths.'))
    .addIntegerOption(option =>
      option.setName('wins')
        .setDescription('Set wins.'))
    .addIntegerOption(option =>
      option.setName('losses')
        .setDescription('Set losses.'))
    .addIntegerOption(option =>
      option.setName('mvp')
        .setDescription('Set MVPs.')),
  category,
  async execute(interaction) {
    if (!interaction.member.permissions.has(global._HOSTROLE))
        return interaction.reply({ content: 'You do not have access to this command.', ephemeral: true })

    // ELO vars
    let eloGainOnWin = 90
    let eloGainOnKill = 20
    let eloLossOnLose = 100
    let eloLossOnDeath = 10

    // Get all option data from userOption
    const targetUser = interaction.options.getUser('user')
    let setKills = interaction.options.getInteger('kills')
    let setDeaths = interaction.options.getInteger('deaths')
    let setWins = interaction.options.getInteger('wins')
    let setLosses = interaction.options.getInteger('losses')
    let setMVPs = interaction.options.getInteger('mvp')

    // Query for user in db
    const query = {
        userId: targetUser.id,
        guildId: interaction.guild.id,
    }

    try {
      const userData = await Model.findOne(query)
            
      if (!userData) return interaction.reply('This user does not have an existing profile!')

      if (setKills !== undefined)
        userData.Kills = setKills || userData.Kills;
      if (setDeaths !== undefined)
        userData.Deaths = setDeaths || userData.Deaths;
      if (setWins !== undefined)
        userData.Wins = setWins || userData.Wins;
      if (setLosses !== undefined)
        userData.Losses = setLosses || userData.Losses;
      if (setMVPs !== undefined)
        userData.MVPs = setMVPs || userData.MVPs;

      await interaction.reply(`Changed ${userData.username}'s STATS:\nKills: ${userData.Kills}\nDeaths: ${userData.Deaths}\nWins: ${userData.Wins}\nLosses: ${userData.Losses}\nMVP: ${userData.MVP}`)

      // CALCULATE KDR, ELO, AND RANK

      // Calculate KDR (bunch of checks cus ts wasn't working)
      if (userData.Kills != 0 && userData.Deaths != 0)
        userData.KDR = parseFloat((userData.Kills / userData.Deaths).toFixed(2))

      if (isNaN(userData.KDR))
        userData.KDR = 0

      // Calculate ELO
      if (userData.ELO >= 6000) {
        eloGainOnWin = 50
        eloGainOnKill = 10
        eloLossOnLose = 75
        eloLossOnDeath = 25
      }

      let eloWin
      let eloKill
      let eloLose
      let eloDeath

      if (userData.Wins > 0)
        eloWin = userData.Wins * eloGainOnWin
    
      if (userData.Kills > 0)
        eloKill = userData.Kills * eloGainOnKill
    
      if (userData.Losses > 0)
        eloLose = userData.Losses * eloLossOnLose
  
      if (userData.Deaths > 0)
        eloDeath = userData.Deaths * eloLossOnDeath

      userData.ELO = eloWin + eloKill - eloLose - eloDeath

      // Calculate RANK
      if (userData.ELO >= 600)
        userData.Rank = 'S'
      else if (userData.ELO > 500)
        userData.Rank = 'A'
      else if (userData.ELO > 400)
        userData.Rank = 'B'
      else if (userData.ELO > 300)
        userData.Rank = 'C'
      else if (userData.ELO > 200)
        userData.Rank = 'D'
      else if (userData.ELO > 100)
        userData.Rank = 'F'
      else
        userData.Rank = 'N/A' // just a check ;)

      await userData.save()
      interaction.followUp('Calculating KDR, ELO & RANK. Saved to database.')

    } catch (error) {
      console.error('Error querying the database.', error)
      await interaction.reply('Error querying the database. Check the console for more details.')
    }
  }
}