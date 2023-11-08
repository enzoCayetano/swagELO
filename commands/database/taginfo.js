const { SlashCommandBuilder } = require('discord.js')
const { Tags } = require('../../database.js')
const category = __dirname.split('/').pop()

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taginfo')
    .setDescription('Get tag info.')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('Name of the tag')
        .setRequired(true)),
    category,
    async execute(interaction) {
      const tagName = interaction.options.getString('name')

      const tag = await Tags.findOne({ where: { name: tagName } })

      if (tag) 
        return interaction.reply(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`)
      
      return interaction.reply(`Could not find tag: ${tagName}`)
    }
}