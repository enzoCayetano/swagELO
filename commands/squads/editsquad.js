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
      const query = {
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      }

      try {
        const userData = await UserModel.findOne(query)

        if (!userData || userData.Squad === 'None') return interaction.reply('You are not in a squad.')
        
        const squadData = await SquadModel.findOne({ 'members.userId': interaction.user.id })

        if (!squadData) return interaction.reply('Squad not found.')

        const modal = new ModalBuilder()
          .setCustomId('edit_squad')
          .setTitle('Edit Squad')

        const nameInput = new TextInputBuilder()
          .setCustomId('squad_name')
          .setLabel('Squad Name')
          .setPlaceholder('Edit your squad name...')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(20)
          .setRequired(true)
          .setValue(squadData.name)
  
        const tagInput = new TextInputBuilder()
          .setCustomId('squad_tag')
          .setLabel('Squad Tag')
          .setPlaceholder('Edit your squad tag...')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(4)
          .setRequired(true)
          .setValue(squadData.tag)
  
        const descInput = new TextInputBuilder()
          .setCustomId('squad_desc')
          .setLabel('Squad Description')
          .setPlaceholder('Edit your squad description...')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1000)
          .setRequired(true)
          .setValue(squadData.description)

        const firstRow = new ActionRowBuilder().addComponents(nameInput)
        const secondRow = new ActionRowBuilder().addComponents(tagInput)
        const thirdRow = new ActionRowBuilder().addComponents(descInput)
    
        modal.addComponents(firstRow, secondRow, thirdRow)
    
        await interaction.showModal(modal)

        const filter = (interaction) => interaction.customId === 'edit_squad'
        interaction
          .awaitModalSubmit({ filter, time: 60000 })
          .then((modalInteraction) => {
            squadData.name = modalInteraction.fields.getTextInputValue('squad_name')
            squadData.tag = modalInteraction.fields.getTextInputValue('squad_tag')
            squadData.description = modalInteraction.fields.getTextInputValue('squad_desc')

            userData.Squad = squadData.name
            squadData.save()

            userData.NeedsUpdate = true
            userData.save()

            modalInteraction.reply(`${userData.Squad} edited successfully!`)
          })
      } catch (error) {
        console.error("Error querying the database.", error)
      }
    }
}