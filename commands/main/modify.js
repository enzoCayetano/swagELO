const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
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
    
  }
};
