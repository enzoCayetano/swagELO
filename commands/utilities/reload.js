const { SlashCommandBuilder } = require('discord.js')
const global = require('../../roles.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to reload.')
        .setRequired(true)),
  category,
  async execute(interaction) {
    if (!interaction.guild.roles.cache.find(role => role.name === global.ADMINROLE.id))
        return interaction.reply({ content: `You do not have access to this command. Only ${global.ADMINROLE}s can use this command.`, ephemeral: true })

    const commandName = interaction.options.getString('command', true).toLowerCase()
    const command = interaction.client.commands.get(commandName)

    if (!command)
      return interaction.reply(`There is no command with name \`${commandName}\`!`)

    delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)]

    try {
      interaction.client.commands.delete(command.data.name)
      const newCommand = require(`../${command.category}/${command.data.name}.js`)
      interaction.client.commands.set(newCommand.data.name, newCommand)
      await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true })
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral: true })
    }
  }
}