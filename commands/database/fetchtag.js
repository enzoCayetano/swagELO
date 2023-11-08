const { SlashCommandBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const { Tags } = require('../../database.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fetchtag')
    .setDescription('Fetch a tag')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('Name of the tag')
        .setRequired(true)),
  category,
  async execute(interaction) {
    const tagName = interaction.options.getString('name')

    const tag = await Tags.findOne({ where: { name: tagName } })

    if (tag) {
      await tag.increment('usage_count')
      return interaction.reply(tag.get('description'))
    }

    return interaction.reply(`Could not find tag: ${tagName}`)
  }
}