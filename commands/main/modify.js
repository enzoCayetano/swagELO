const { SlashCommandBuilder } = require('discord.js');
const global = require('../../roles.js');
const category = __dirname.split('/').pop();
const Model = require('../../schemas/data.js');

let eloGainOnWin = 90
let eloGainOnKill = 20
let eloLossOnLose = -100
let eloLossOnDeath = -10

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('modify')
    .setDescription('Modify user data. [HOST ONLY]')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Which user to modify.')
        .setRequired(true)),
  category,
  async execute(interaction) {
    if (!interaction.member.permissions.has(global._HOSTROLE))
        return interaction.reply({ content: 'You do not have access to this command.', ephemeral: true })

    // Get user from userOption
    const targetUser = interaction.options.getUser('user')

    // Query for user in db
    const query = {
        userId: targetUser.id,
        guildId: interaction.guild.id,
    }

    try {
      const userData = await Model.findOne(query)
            
      if (!userData) return interaction.reply('This user does not have an existing profile!')

      await interaction.reply(`USER SELECTED => ${userData.username}\nWhat would you like to modify?\n1. Kills\n2. Deaths\n3. Wins\n4. Loses\n5. MVP`)

      const filter = (message) => {
        return message.author.id && ['1', '2', '3', '4', '5'].includes(message.content.trim())
      }

      const collectorType = interaction.channel.createMessageCollector({
        filter,
        time: 15000,
      })

      let modifyType

      collectorType.on('collect', (message) => {
        switch (message.content.trim()) {
          case '1':
            modifyType = 'Kills'
            break
          case '2':
            modifyType = 'Deaths'
            break
          case '3':
            modifyType = 'Wins'
            break
          case '4':
            modifyType = 'Loses'
            break
          case '5':
            modifyType = 'MVP'
            break
        }

        if (modifyType != 'MVP')
          interaction.followUp(`How many ${modifyType.toLowerCase()} do you want to add/remove?`)
        else
          interaction.followUp(`How many ${modifyType}s do you want to add/remove?`)

        const filterNumber = (message) => {
          return message.author.id === message.author.id && !isNaN(parseInt(message.content.trim()))
        }
        
        const collectorNumber = interaction.channel.createMessageCollector({
          filter: filterNumber,
          time: 30000, // 30 Seconds
        })

        collectorNumber.on('collect', async (message) => {
          const amount = parseInt(message.content.trim())

          switch (modifyType) {
            case 'Kills':
              userData.Kills += amount
              if (userData.Kills < 0) userData.Kills = 0
              break
            case 'Deaths':
              userData.Deaths += amount
              if (userData.Deaths < 0) userData.Deaths = 0
              break
            case 'Wins':
              userData.Wins += amount
              if (userData.Wins < 0) userData.Wins = 0
              break
            case 'Loses':
              userData.Loses += amount
              if (userData.Deaths < 0) userData.Loses = 0
              break
            case 'MVP':
              userData.MVP += amount
              if (userData.MVP < 0) userData.Deaths = 0
              break
          }
          
          if (amount >= 0) {
            if (modifyType != 'MVP')
              interaction.followUp(`Successfully added ${amount} ${modifyType.toLowerCase()} to ${userData.username}.`)
            else
              interaction.followUp(`Successfully added ${amount} ${modifyType}s to ${userData.username}.`)
          } else {
            if (modifyType != 'MVP')
              interaction.followUp(`Successfully removed ${-amount} ${modifyType.toLowerCase()} from ${userData.username}.`)
            else
              interaction.followUp(`Successfully removed ${-amount} ${modifyType}s from ${userData.username}.`)
          }

          collectorNumber.stop()

          // CALCULATE KDR, ELO, AND RANK

          // Calculate KDR (bunch of checks cus ts wasnt working)
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

          if (userData.Wins > 0)
            userData.ELO += userData.Wins * eloGainOnWin
        
          if (userData.Kills > 0)
            userData.ELO += userData.Kills * eloGainOnKill
        
          if (userData.Loses > 0)
            userData.ELO += userData.Loses * eloLossOnLose
      
          if (userData.Deaths > 0)
            userData.ELO += userData.Deaths * eloLossOnDeath

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
        })

        collectorNumber.on('end', (collected, reason) => {
          if (reason === 'time') {
            interaction.followUp('Modifying timed out.')
          }
        })

        collectorType.stop()
      })

      collectorType.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp('Modifying timed out.')
        }
      })

    } catch (error) {
      console.error('Error querying the database.', error)
      await interaction.reply('Error querying the database. Check the console for more details.')
    }
  }
}