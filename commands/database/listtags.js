const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../database.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listtags')
    .setDescription('List all tags.'),
    category,
    async execute(interaction) {
      const tagList = await Tags.findAll({ attributes: ['name'] })
      const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.'

      return interaction.reply(`List of tags: ${tagString}`)
    }
}