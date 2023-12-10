const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const UserModel = require('../../schemas/user.js')
const SquadModel = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editsquad')
    .setDescription('Edit squad information. [LEADER ONLY]'),
    category,
    async execute(interaction) {
      await interaction.reply('W.I.P.')
    }
}