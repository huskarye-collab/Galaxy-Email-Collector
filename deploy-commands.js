
require("dotenv").config();

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Post the Galaxy Email Collector message")
    .toJSON()
];

const rest = new REST({ version: "10" })
  .setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands("1574038302774788126"),
      { body: commands }
    );

    console.log("Successfully registered /setup!");
  } catch (error) {
    console.error(error);
  }
}

registerCommands();
