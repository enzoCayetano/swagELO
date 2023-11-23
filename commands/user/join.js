const { SlashCommandBuilder } = require('discord.js')
const Model = require('../../schemas/user.js')
const global = require('../../roles.js')
const category = __dirname.split('/').pop()

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Create a new profile!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of profile')),
    category,
    async execute(interaction) {
        // Look if profile exists
        const query = {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        }

        try {
            if (!interaction.guild.roles.cache.find(role => role.name === global.REQUIREDROLE))
                return interaction.reply({ content: `You are not a ${global.REQUIREDROLE}.`, ephemeral: true })

            const model = await Model.findOne(query)
            
            if (model) {
                // Profile exists
                await interaction.reply({ content: 'You already have a profile!', ephemeral: true })
            } else {
                // Create new profile -- REMEMBER TO UPDATE SCHEMA IF ADD NEW THINGS
                const newModel = new Model({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    username: interaction.options.getString('name') || interaction.user.username,
                    ELO: 0,
                    Rank: 'N',
                    Kills: 0,
                    Deaths: 0,
                    Wins: 0,
                    Losses: 0,
                    KDR: 0,
                    MVP: 0,
                })
                await newModel.save()

                const currentTime = new Date()

                // Set nickname
                const updatedNick = `[0 ELO] ${interaction.user.username}`

                const nickMember = interaction.guild.members.cache.get(interaction.user.id)

                if (nickMember) {
                    await nickMember.setNickname(updatedNick)
                    .then(() => {
                        console.log(`Successfully set nickname ${nickMember} for ${interaction.user.username}`)
                    })
                    .catch(error => {
                        console.error('Error setting username: ', error)
                    })
                } else {
                    console.log('Member not found.')
                }
                
                await interaction.reply({ content: `${interaction.user.username} has joined matchmaking at ${currentTime}.` })
            }

        } catch (error) {
            console.log(`Error creating profile: ${error}`)
            await interaction.reply(`Error creating profile. ${error}`)
        }

    },
}