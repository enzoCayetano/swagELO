// Require necessary discord.js classes and .env
const fs = require('node:fs')
const path = require('node:path')
const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

// Create new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// Create commands
client.commands = new Collection()

// Get subfolders path
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

// For each folder in ./commands
for (const folder of commandFolders) {
    // Get commands '.js' from subfolders
    const commandsPath = path.join(__dirname, 'commands')
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath)
        
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`Warning! The command at ${filePath} is missing a required "data" or "execute" property!`)
        }
    }   
}

client.on(Events.InteractionCreate, interaction => {
    // If not input command
    if (!interaction.isChatInputCommand()) return
    console.log(interaction)
});

client.on(Events.InteractionCreate, async interaction => {
    // If not chat input command
    if (!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    // No command found
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found!`)
        return
    }

    try {
        // Execute command
        await command.execute(interaction)
    } catch (error) {
        console.error(error)

        // Send error privately to user who entered command
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true })
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    }
});



client.login(process.env.DISCORD_TOKEN)