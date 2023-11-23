const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js')
const category = __dirname.split('/').pop()
const Model = require('../../schemas/squad.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createsquad')
    .setDescription('Create a squad! [SERVER BOOSTERS ONLY]'),
  category,
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('create_squad')
      .setTitle('Create Squad')

    const nameInput = new TextInputBuilder()
      .setCustomId('setSquadName')
      .setLabel('Name your squad...')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(20)

    const tagInput = new TextInputBuilder()
      .setCustomId('setSquadTag')
      .setLabel('Set squad tag [4 CHARS]')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)

    const descInput = new TextInputBuilder()
      .setCustomId('setSquadDesc')
      .setLabel('Set a description...')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(100)

    const firstRow = new ActionRowBuilder().addComponents(nameInput)
    const secondRow = new ActionRowBuilder().addComponents(tagInput)
    const thirdRow = new ActionRowBuilder().addComponents(descInput)

    modal.addComponents(firstRow, secondRow, thirdRow)

    await interaction.showModal(modal)
  }
}