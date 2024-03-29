const { Client, Collection, GatewayIntentBits, ActivityType} = require('discord.js');
const fs = require('fs');
const path = require('path');
const read = require(path.join(__dirname, "/commands/ReadBot.js"));
// Discord Clientのインスタンス作成
const client = new Client({ intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, "/commands/")).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, `/commands/${file}`));
    client.commands.set(command.data.name, command);
}

client.on('ready', message =>{
    console.log('Bot準備完了！');
    client.user.setPresence({
        activities: [{ name: `Jinとのあれこれ`, type: ActivityType.Playing }]});
});

client.on('messageCreate', message =>{
    if(message.author.bot) return; //BOTのメッセージには反応しない

    if(read.isReadStarted[message.guild.id] && read.channels[message.guild.id] === message.channel.toString()){

        read.talk(message);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'コマンド実行時にエラーが発生しました。', ephemeral: true});
    }
});

client.login(process.env.DISCORD_TOKEN);