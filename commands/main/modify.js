const { SlashCommandBuilder } = require('discord.js')
const global = require('../../roles.js')
const category = __dirname.split('/').pop()
const Model = require('../../schemas/data.js')

module.exports = {
  cooldown: 10,
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

      await interaction.reply('How many kills do you want to add?')

      const filter = (message) => message.author.id === interaction.user.id
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60000, // minute
      })

      collector.on('collect', async (message) => {
        console.log('Message collected:', message.content);
        const killsToAdd = parseInt(message.content)

        if (!isNaN(killsToAdd)) {
          userData.Kills += killsToAdd
          await userData.save()
          interaction.followUp(`Added ${killsToAdd} to ${userData.username}`)
        } else {
          interaction.followUp('Invalid input. Please provide a valid number.')
        }

        collector.stop()
      })

      collector.on('end', (collected, reason) => {
        console.log('Collector ended:', reason);
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
