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

      await interaction.reply(`USER SELECTED => ${userData.username}\nWhat would you like to modify?\n1. Kills\n2. Deaths\n3. MVP`)

      const filter = (message) => {
        return message.author.id === message.author.id && ['1', '2', '3'].includes(message.content.trim())
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

          userData.KDR = parseFloat((userData.Kills / userData.Deaths).toFixed(2))

          await userData.save()
          interaction.followUp('Saved to database.')
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
};
