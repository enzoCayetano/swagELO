const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../database.js')
const category = __dirname.split('/').pop()

module.exports =  {
  data: new SlashCommandBuilder()
    .setName('deletetag')
    .setDescription('Delete a tag.'),
    category,
    async execute(interaction) {
      const tagName = interaction.options.getString('name')

      const rowCount = await Tags.destroy({ where: { name: tagName } })

      if (!rowCount) return interaction.reply('That tag doesn\'t exist.')

      return interaction.reply(`Tag ${tagName} was deleted.`)
    }
}