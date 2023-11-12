// Require necessary discord.js classes and .env
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose')
const fs = require('node:fs')
const path = require('node:path')

const dotenv = require('dotenv')
dotenv.config()

// Create new client instance
const client = new Client({ intents: [ GatewayIntentBits.Guilds ] })

// Create commands
client.commands = new Collection()
client.cooldowns = new Collection()

// Get subfolders path
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

// For each folder in ./commands
for (const folder of commandFolders) {
    // Get commands '.js' from subfolders
    const commandsPath = path.join(foldersPath, folder)
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

// Event handler
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles)
{
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once)
    {
        client.once(event.name, (...args) => event.execute(...args))
    }
    else
    {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

// Connect to mongoose
mongoose.connect(process.env.MONGODB_URL)

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

client.login(process.env.DISCORD_TOKEN)