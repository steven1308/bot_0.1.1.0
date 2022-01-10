const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { validateID } = require("ytdl-core");
const fs = require("fs");
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const config = require(`${__dirname}/config.json`);
const delight = require("./delight.js");
const ping = require("./src/ping.js");
const Record = require("./src/Record.js");
const utils = require("./src/utils.js")
const voice = require('@discordjs/voice');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
// const VOICEclient = new Client({ intents:[Intents.FLAGS.GUILD_VOICE_STATES]});
let shuffleck = false;
let shufflelist = [];
let playlist = [];
let guild ,member;
let connection;
let dispatcher;
let list = [];
client.on("ready", () => {
    client.channels.cache.get(config.channel).send("bot is online");
    console.log(`bot is online ${client.user.tag}!`);
});

client.on("voiceStateUpdate", (oldState, newState) => {

    if (newState.member.user.bot && newState.channel === null) {
        list = [];
        connection = undefined;
    }

    Record(client, config, oldState, newState);

});

// test

let isplay = false;
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.Token1 + config.Token2);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands("468632395612946433", "381392874404577280"),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isCommand()) return;

    if (interaction.commandName != undefined) {
        await interaction.deferReply();
        await interaction.editReply('Pong!');
        await interaction.deleteReply();
    }

     guild = client.guilds.cache.get(interaction.guildId);
     member = guild.members.cache.get(interaction.member.user.id);
console.log(interaction.channelId);
      

    switch (interaction.commandName) {
        case 'ping':
            console.log(interaction.options.getInteger("次數"));
            ping(interaction, client, config);
           
            // interaction.editReply('Pong!');
            break;
        case 'join':

            connection = voice.joinVoiceChannel({
                channelId: member.voice.channelId,
                guildId: guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            break;
        case 'shutdown':
            if (connection === undefined) return;
            
            list = [];
            shufflelist = [];
            shuffleck = false;

            connection.destroy();
            connection=undefined;
            break;
        case 'notjoin':
            msg.channel.send('請先加入頻道');
            break;
        case 'list':
            queue(msg, args[0]);
            break;
        case 'play':
           let args = interaction.options.getString('網址');
        
        await churl(interaction, args, true);
            break;
        case 'playnow':
            churl(client, args[0], false);
            break;
        case 'shuffle':
            shuffle(msg);
            break;
        case "skip":
            if (list.length > 0) {
                msg.channel.send(`已跳過${list[0].name} `);
                dispatcher.end();
            } else {
                msg.channel.send(`播放序列是空的!`);
            }

            break;
        default:
            // client.channels.cache.get(msg.channel.id).send("err");
            msg.channel.send("error");
            break;
    };
});

client.on("messageCreate", async (msg) => {

    if (msg.author.bot) return;

    /**
     * 趣味 :)
     */
    delight(msg, client);
});

function queue(msg, cord1) {

    if (list.length === 0) {
        client.channels.cache.get(msg.channel.id).send('歌單是空的');
        return;
    }


    let queue = [];
    let i = 0, b;
    let a = playlist.length / 10;
    let atime = 0;
    if (playlist.length > config.listmax) {
        d = config.listmax;
    } else {
        d = playlist.length
    }
    // console.log(cord1);
    if (cord1 === undefined || cord1 === '1') {
        i = 0;
        cord1 = 0;
        b = `${i / 10 + 1}/${Math.round(a) + 1}頁\n`;
    } else {

        if (cord1 <= Math.round(a) + 1) {
            i = (cord1 - 1) * 10;

            b = `${cord1}/${Math.round(a)}頁\n`;
            cord1 = i;
        }
    }
    // console.log(cord1);
    for (k = 0; i < cord1 + config.listmax; i++, k++) {
        if (playlist[i] !== undefined) {
            if (playlist[i].type === "play") {
                // queue[k] = "`[" + `${(i + 1).toString().padStart(2, "0")}`+ "]`  ▶ " + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 `+"**"+`${playlist[i].user}`+"**" +`加入`
                console.log("test");
                queue.splice(1, 0, "`[" + `${(1).toString().padStart(2, "0")}` + "]`  ▶ " + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 ` + "**" + `${playlist[i].user}` + "**" + `加入`)
            } else {

                queue[k] = "`[" + `${(i + 1).toString().padStart(2, "0")}` + "]`" + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 ` + "**" + `${playlist[i].user} ` + "**" + `加入`
            }
        }
    }

    queue.unshift(b);

    for (let i = 0; i < playlist.length; i++) {

        atime += utils.mintosec(playlist[i].time);

    }
    atime = utils.getTime(atime);

    queue.push(`\n序列中目前有 ${playlist.length} 個 曲目 ，長度是 [${atime}]`)

    client.channels.cache.get(msg.channel.id).send(queue);
    // console.log(queue); 
}

async function playMusic(msg, url, id) {

    const player = createAudioPlayer();

    // const stream = await ytdl(url, {
    //     highWaterMark: 1 << 25,
    //     filter: 'audioonly'
    // });

    const resource = createAudioResource("1.mp3");

    // const resource = createAudioResource(stream, {
    //     inputType: StreamType.Opus
    // });

    connection.subscribe(player);
    player.play(resource);

    // dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));
    // list[0].type = "play";
    // dispatcher.setVolume(0.06);

    // dispatcher.on('finish', () => {

    //     // list = list.filter(() => )

    //     if (playlist.length > 0) {

    //         playMusic(msg, playlist[0].url);

    //     } else {
    //         isplay = false;
    //         msg.channel.send('目前沒有音樂了，請加入音樂 :D');
    //     }
    // });


    return dispatcher;
}


async function churl(interaction, args, ck) {
    let i = 0;
    // console.log(args);


    if (ytpl.validateID(args)) {

        const loadlist = await ytpl(args, { limit: "Infinity" });

        for (i = 0; i < loadlist.items.length; i++) {
            if (ck) {

                list.push({
                    name: loadlist.items[i].title,
                    url: loadlist.items[i].url,
                    time: loadlist.items[i].duration,
                    status: "normal",
                    // user: msg.author.username,
                    type: "wait",
                    id: loadlist.id
                })

            } else {

                list.unshift({
                    name: loadlist.items[i].title,
                    url: loadlist.items[i].url,
                    time: loadlist.items[i].duration,
                    status: "jump",
                    type: "wait",
                    // user: msg.author.username,
                    id: loadlist.id
                })

            }
        }
       
        client.channels.cache.get(interaction.channelId).send(`已從播放清單 ${loadlist.title} 新增` + " `" + i + "` " + "首歌");
        

    } else if (ytdl.validateURL(args)) {

        const res = await ytdl.getInfo(args);
        const info = res.videoDetails;

        if (ck) {

            list.push({
                name: info.title,
                url: args,
                time: utils.getTime(info.lengthSeconds),
                status: "normal",
                type: "wait",
                // user: msg.author.username,
                id: info.id
            });

            interaction.channel.send(`歌曲加入隊列:${info.title}`);
        } else {

            list.unshift({
                name: info.title,
                url: args,
                time: utils.getTime(info.lengthSeconds),
                status: "jump",
                type: "wait",
                // user: msg.author.username,
                id: info.id
            });
            client.channels.cache.get(interaction.channel.id).send(`歌曲差入隊列:${info.title}`);
            // msg.channel.send(`歌曲差入隊列:${info.title}`);
        }
    } else {
        client.channels.cache.get(interaction.channel.id).send(`查無此歌曲或歌單`);
        // msg.channel.send(`查無此歌曲或歌單`);
        return;
    }

    playlist = list;

    // if (connection === undefined) {
     

    //     connection = joinVoiceChannel({
    //         channelId: member.voice.channelId,
    //         guildId: guild.id,
    //         adapterCreator: interaction.guild.voiceAdapterCreator,
    //         selfDeaf: false,
    //         selfMute: false
    //     });
    // }

    if (!isplay) {
        playMusic(interaction, list[0].url, list[0].id);
        isplay = true;
    }
}

function shuffle(msg) {

    let temp = [];
    temp = temp.concat(list);
    temp.sort(() => Math.random() - 0.5);

    shufflelist = shufflelist.concat(temp);
    temp = [];
    playlist = shufflelist;


    shuffleck = true;

    msg.channel.send(`清單以隨機撥放`);

}

client.login(config.Token1 + config.Token2);