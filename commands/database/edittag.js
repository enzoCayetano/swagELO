const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const { Tags } = require('../../database.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edittag')
    .setDescription('Edit a tag.'),
    category,
    async execute(interaction) {
      const tagName = interaction.options.getString('name')
      const tagDescription = interaction.options.getString('description')

      const affectedRows = await Tags.update({ description: tagDescription}, { where: { name: tagName} })

      if (affectedRows > 0) return interaction.reply(`Tag ${tagName} was edited.`)

      return interaction.reply(`Could not find a tag with name ${tagName}`)
    }
}