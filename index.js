// Require necessary discord.js classes and .env
const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()

// Create new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)