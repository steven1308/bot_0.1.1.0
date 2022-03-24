
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const voice = require('@discordjs/voice');
const ping = require("./src/ping.js");
const Record = require("./src/Record.js");
const utils = require("./src/utils.js");
const config = require("./src/config/config.js");

let shuffleck = false;
let shufflelist = [];
let playlist = [];
let guild, member;
let dispatcher;
let list = [];
let isPlay = false;
let audioPlayer;
let pauseck = false;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.Token1 + config.Token2);

client.on("ready", async () => {

    client.channels.cache.get(config.channel).send("bot is online");
    console.log(`bot is online ${client.user.tag}!`);

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, "381392874404577280"),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }
});

client.on("voiceStateUpdate", (oldState, newState) => {

    if (newState.member.user.bot && newState.channel === null) {
        list = [];
        connection = undefined;
    }

    Record(client, config, oldState, newState);
});

// client.on("messageCreate", async (msg) => {

//     if (msg.author.bot) return;

//     /**
//      * 趣味 :)
//      */
//     delight(msg, client);
// });

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isCommand()) return;

    if (interaction.commandName != undefined) {
        await interaction.deferReply();
        await interaction.editReply('Pong!');
        await interaction.deleteReply();
    }

    guild = client.guilds.cache.get(interaction.guildId);
    member = guild.members.cache.get(interaction.member.user.id);

    switch (interaction.commandName) {

        case 'game':

            game(interaction, interaction.options.getInteger("數字"));
            break;


        case 'ping':

            // console.log(interaction.options.getInteger("次數"));
            ping(interaction, client, config);

            break;
        case 'join':

            voice.joinVoiceChannel({
                channelId: member.voice.channelId,
                guildId: guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            break;
        case 'shutdown':

            const connection = voice.getVoiceConnection("381392874404577280");


            list = [];
            shufflelist = [];
            shuffleck = false;
            connection.disconnect();
            isPlay = false;
            break;
        case 'pause':
            pause(interaction);


            break;
        case 'list':

            queue(interaction, interaction.options.getInteger("頁數"));

            break;
        case 'play':
            let args = interaction.options.getString('網址');
            if (args === null) {
                args = interaction.options.getString('預設');
            }
            await churl(interaction, args, true);

            break;

        case 'playnow':

            churl(client, args[0], false);

            break;
        case 'shuffle':

            shuffle(interaction);

            break;
        case "skip":

            if (list.length > 0) {
                interaction.channel.send(`已跳過${playlist[0].name} `);
                playFinish();
            } else {
                interaction.channel.send(`播放序列是空的!`);
            }

            break;
        case "nowplay":

            nowplay(interaction)

            break;
    };
});



let gamemember = [];
function game(interaction, number) {
    let rd;
    for (let i = 0; i < gamemember.length; i++) {

        if (gamemember[i].player === interaction.user.username) {
            if (number === gamemember[i].rdnumber) {
                // console.log('1');
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`恭喜 <@${gamemember[i].playerId}> 回答正確，答案是 ${"**"}${gamemember[i].rdnumber}${"**"} `);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });

                gamemember.splice(i, 1);

            } else if (gamemember[i].frequency<2) {

                const embed = new MessageEmbed()
                .setTitle('數字猜猜樂')
                .setColor(0xFF60AF)
                .setDescription(`噗噗~ <@${gamemember[i].playerId}>你選的 ${"**"}${number}${"**"} 是錯的\n好菜喔~答案是 ${"**"}${gamemember[i].rdnumber}${"**"}\n這樣都猜不到！`);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
                gamemember.splice(i, 1);
            } else if (number > gamemember[i].rdnumber) {
                // console.log('2');
                gamemember[i].frequency--;
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`<@${gamemember[i].playerId}> 可惜，正確答案比 ${"**"}${number}${"**"} ${"`"}小${"`"}\n你還剩 ${"**"}${ gamemember[i].frequency}${"**"} 次機會。`);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });



            } else if (number < gamemember[i].rdnumber) {
                // console.log('3');
                gamemember[i].frequency--;
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`<@${gamemember[i].playerId}> 可惜，正確答案比 ${"**"}${number}${"**"} ${"`"}大${"`"}\n你還剩 ${"**"}${gamemember[i].frequency}${"**"} 次機會。`);

                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
            }

            return;

        }

    }
    rd = Math.floor(Math.random() * 99+1);
    // console.log(rd);
    gamemember.push({

        rdnumber: rd,
        player: interaction.user.username,
        playerId: interaction.user.id,
        frequency: 5

    })
    game(interaction, number)



}





function pause(interaction) {
    if (!pauseck) {
        interaction.channel.send('已經暫停');
        audioPlayer.pause();
        pauseck = true;
    } else {
        audioPlayer.unpause();
        pauseck = false;
    }


}







async function nowplay(interaction) {

    const res = await ytdl.getInfo(playlist[0].url);
    const info = res.videoDetails;

    const embed = new MessageEmbed()

        .setTitle('現在播放')
        .setColor(0xFF60AF)
        .setDescription(`${info.ownerChannelName}\n${playlist[0].name}\n\n${playlist[0].url}\n歌曲由:${playlist[0].user}加入`);

    client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });

}

function queue(interaction, cord1) {

    if (list.length === 0) {
        client.channels.cache.get(interaction.channel.id).send('歌單是空的');
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


    if (cord1 === null || cord1 === '1') {
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


    for (k = 0; i < cord1 + config.listmax; i++, k++) {
        if (playlist[i] !== undefined) {
            if (playlist[i].type === "play") {
                queue.splice(1, 0, "`[" + `${(1).toString().padStart(2, "0")}` + "]`  ► " + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 ` + "**" + `${playlist[i].user}` + "**" + `加入`)
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

    client.channels.cache.get(interaction.channel.id).send(queue.join('\n'));
}

async function playMusic(url, id) {

    const connection = voice.getVoiceConnection("381392874404577280");
    audioPlayer = voice.createAudioPlayer();

    const stream = await ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25
    });

    const resource = voice.createAudioResource(stream);

    connection.subscribe(audioPlayer);
    audioPlayer.play(resource);

    playlist[0].type = "play";

    audioPlayer.on("stateChange", (oldState, newState) => {
        if (newState.status == "idle") {

            playFinish();
        }
    });

    audioPlayer.on("error", (error) => {
        console.error(error);
    });

    return dispatcher;
}


async function churl(interaction, args, ck) {
    let i = 0;
    let tempList = [];

    if (ytpl.validateID(args)) {

        const ytplData = await ytpl(args, { limit: "Infinity" });

        for (i = 0; i < ytplData.items.length; i++) {

            // 

            if (ck) {

                tempList.push({
                   
                    name: ytplData.items[i].title,
                    url: ytplData.items[i].url,
                    time: ytplData.items[i].duration,
                    status: "normal",
                    user: interaction.user.username,
                    type: "wait",
                    id: ytplData.id
                })

            } else {

                tempList.unshift({
                    
                    name: ytplData.items[i].title,
                    url: ytplData.items[i].url,
                    time: ytplData.items[i].duration,
                    status: "jump",
                    type: "wait",
                    user: interaction.user.username,
                    id: ytplData.id
                })

            }
        }


        client.channels.cache.get(interaction.channelId).send(`已從播放清單 ${ytplData.title} 新增` + " `" + i + "` " + "首歌");

    } else if (ytdl.validateURL(args)) {

        const res = await ytdl.getInfo(args);
        const info = res.videoDetails;

        if (ck) {

            tempList.push({
                name: info.title,
                url: args,
               
                time: utils.getTime(info.lengthSeconds),
                status: "normal",
                type: "wait",
                user: interaction.user.username,
                id: info.id
            });

            interaction.channel.send(`歌曲加入隊列:${info.title}`);
        } else {

            tempList.unshift({
                name: info.title,
                url: args,
               
                time: utils.getTime(info.lengthSeconds),
                status: "jump",
                type: "wait",
                user: interaction.user.username,
                id: info.id
            });
            client.channels.cache.get(interaction.channel.id).send(`歌曲差入隊列:${info.title}`);

        }
    } else if (pauseck) {
        pause(interaction);
    } else {
        client.channels.cache.get(interaction.channel.id).send(`查無此歌曲或歌單`);

        return;
    }
    list = list.concat(tempList);
    playlist = list;
    if (shuffleck) {

        shuffljoin(tempList);
    }
    tempList = [];
    voice.joinVoiceChannel({
        channelId: member.voice.channelId,
        guildId: guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });


    if (!isPlay) {
        playMusic(playlist[0].url, playlist[0].id);
        isPlay = true;
    }

}
function shuffljoin(tempList) {


    tempList.sort(() => Math.random() - 0.5);
    let rd = 0;


    for (let i = 0; i < tempList.length; i++) {
        rd = Math.floor(Math.random() * shufflelist.length);


        shufflelist.splice(rd, 0, tempList[i]);

    }

    playlist = shufflelist;

}
function shuffle(msg) {
    if (shuffleck == false) {
        if (list.length != 0) {
            let temp = [];
            let temp2 = [];
            temp = temp.concat(list);
            temp2 = temp.shift();
            temp.sort(() => Math.random() - 0.5);
            shufflelist = shufflelist.concat(temp);
            shufflelist.unshift(temp2);
            temp = [];
            temp2 = [];
            playlist = shufflelist;
            shuffleck = true;
            msg.channel.send(`播放器將隨機播放本播放列表`);
        } else {
            shuffleck = true;
            msg.channel.send(`播放器將隨機播放本播放列表`);
        }

    } else {
        if (list.length != 0) {
            playlist = list;
            shuffleck = false;
            msg.channel.send(`播放器將不再隨機播放本播放列表`);
        } else {
            shuffleck = false;
            msg.channel.send(`播放器將不再隨機播放本播放列表`);
        }



    }
}

function playFinish() {

    if (shuffleck) {

        for (let i = 0; i < list.length; i++) {
            if (playlist[0].id === list[i].id) {
                list.splice(i, 1);
                break;
            }
        }




    }
    playlist.shift();
    if (playlist.length > 0) {

        playMusic(playlist[0].url);

    } else {
        isPlay = false;
        msg.channel.send('目前沒有音樂了，請加入音樂 :D');
    }
}

client.login(config.Token1 + config.Token2);