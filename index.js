
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const OWNER_ID = "1556279557630201869";

client.once(Events.ClientReady, (bot) => {
  console.log(`🌌 ${bot.user.tag} is online!`);
});

// Post the email collection message
client.on(Events.InteractionCreate, async (interaction) => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "setup") {

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🌌 Galaxy Email Collector")
        .setDescription(
          "**Type your email so we can answer your questions!**\n\n" +
          "-# Your email will only be used to reply to your question. " +
          "We won't use it for other purposes."
        )
        .setFooter({ text: "Galaxy Email Collector" });

      const button = new ButtonBuilder()
        .setCustomId("email_button")
        .setLabel("Type Your Email")
        .setEmoji("📧")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // Button opens the email form
  if (
    interaction.isButton() &&
    interaction.customId === "email_button"
  ) {
    const modal = new ModalBuilder()
      .setCustomId("email_modal")
      .setTitle("Enter Your Email");

    const emailInput = new TextInputBuilder()
      .setCustomId("email_address")
      .setLabel("Your email address")
      .setPlaceholder("example@email.com")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(254);

    modal.addComponents(
      new ActionRowBuilder().addComponents(emailInput)
    );

    await interaction.showModal(modal);
  }

  // Receive submitted email
  if (
    interaction.isModalSubmit() &&
    interaction.customId === "email_modal"
  ) {
    const email = interaction.fields
      .getTextInputValue("email_address")
      .trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return interaction.reply({
        content: "❌ Please enter a valid email address.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const owner = await client.users.fetch(OWNER_ID);

      const notification = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("📧 New Email Submission")
        .addFields(
          {
            name: "Discord User",
            value: `${interaction.user.tag}`
          },
          {
            name: "Discord User ID",
            value: interaction.user.id
          },
          {
            name: "Submitted Email",
            value: email
          }
        )
        .setTimestamp();

      await owner.send({
        content: `New email submission from <@${interaction.user.id}>!`,
        embeds: [notification]
      });

      await interaction.editReply({
        content: "✅ Your email was submitted successfully! Thank you."
      });

    } catch (error) {
      console.error("Owner notification failed:", error);

      await interaction.editReply({
        content:
          "Your submission could not be delivered. Please try again later."
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
