
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const pathToFfmpeg = require("ffmpeg-static");
const childProcess = require("child_process");
const voice = require('@discordjs/voice');
const ping = require("./src/ping.js");
const Record = require("./src/Record.js");
const utils = require("./src/utils.js");
const config = require("./src/config/config.js");

let isShuffle = false;
let shuffleList = [];
let playlist = [];
let dispatcher;
let list = [];
let isPlay = false;
let audioPlayer;
let isPause = false;

// register Events
registerEvents();

function registerEvents() {
    client.on("ready", async () => {
        client.channels.cache.get(config.channel).send("bot is online");
        console.log(`bot is online ${client.user.tag}!`);
        registerCommands();
    });

    client.on("voiceStateUpdate", (oldState, newState) => {
        if (newState.member.user.bot && newState.channel === null) {
            list = [];
            connection = undefined;
        }
        Record(client, config, oldState, newState);
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;
        if (interaction.commandName != undefined) {
            await interaction.deferReply();
            // await interaction.editReply('Pong!');
            await interaction.deleteReply();
        }
        runCommand(interaction);
    });
}

async function runCommand(interaction) {
    let args;
    let isJump = true;
    switch (interaction.commandName) {
        case "game":
            game(interaction, interaction.options.getInteger("數字"));
            break;
        case "ping":
            ping(interaction, client, config);
            break;
        case "join":
            botJoinVoiceChannel(interaction);
            break;
        case "shutdown":
            shutdown(voice);
            break;
        case "pause":
            pause(interaction);
            break;
        case "list":
            queue(interaction, interaction.options.getInteger("頁數"));
            break;
        case "play":
            isJump = true;
            await churl(interaction, isJump);
            break;
        case "playnext":
            isJump = false;
            await churl(interaction, args, false);
            break;
        case "shuffle":
            shuffle(interaction);
            break;
        case "skip":
            skip(interaction);
            break;
        case "nowplay":
            nowPlay(interaction);
            break;
    };
}

function botJoinVoiceChannel(interaction) {
    let guild = client.guilds.cache.get(interaction.guildId);
    let member = guild.members.cache.get(interaction.member.user.id);
    voice.joinVoiceChannel({
        channelId: member.voice.channelId,
        guildId: guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });
}

async function registerCommands() {
    try {
        const commands = new Array();
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            commands.push(command.toJSON());
        }
        const rest = new REST({ version: '9' }).setToken(config.Token1 + config.Token2);
        await rest.put(Routes.applicationGuildCommands(client.user.id, "381392874404577280"), { body: commands });
    } catch (error) {
        console.error(error);
    }
}

function skip(interaction) {

    let user = interaction.options.getString("數量或人");

    if (playlist.length == 0) {
        interaction.channel.send(`播放序列是空的!`);
        return;
    } else if (user == null) {
        if (playlist.length > 0) {
            interaction.channel.send(`已跳過${playlist[0].name} `);
            playFinish(interaction);

        }
    }
    else if (user != null) {
        user = user.replace("@", "").replace("!", "").replace("<", "").replace(">", "");
        playlist = playlist.filter((a, index) => index === 0 || a.userId !== user);
        list = list.filter((a) => a.userId !== user);
        if (playlist[0].userId == user) {
            playFinish(interaction);
        }
    }
}

function shutdown(voice) {
    const connection = voice.getVoiceConnection("381392874404577280");
    list = [];
    shuffleList = [];
    playlist = [];
    isShuffle = false;
    connection.disconnect();
    isPlay = false;
}

function pause(interaction) {
    if (!isPause) {
        interaction.channel.send('已經暫停');
        audioPlayer.pause();
        isPause = true;
    } else {
        audioPlayer.unpause();
        isPause = false;
        interaction.channel.send('繼續撥放');
    }
}

async function nowPlay(interaction) {

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

    if (playlist.length > config.listMax) {
        d = config.listMax;
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
    // console.log(playlist);

    for (k = 0; i < cord1 + config.listMax; i++, k++) {
        if (playlist[i] !== undefined) {
            if (playlist[i].type === "play") {
                queue.splice(1, 0, "`[" + `${(1).toString().padStart(2, "0")}` + "]`  ► " + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 ` + "**" + `${playlist[i].user}` + "**" + `加入`)
            } else if (playlist[i].status === "jump") {
                queue[k] = "`[" + `${(i + 1).toString().padStart(2, "0")}` + "]`▲" + `${playlist[i].name}` + "`" + `${playlist[i].time}` + "`" + ` 由 ` + "**" + `${playlist[i].user} ` + "**" + `加入`

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

    const musicStream = fs.createWriteStream("video.mp4");

    await ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25
    }).pipe(musicStream);

    musicStream.on("finish", () => {

        childProcess.exec(`${pathToFfmpeg} -i video.mp4 -af loudnorm=I=-16:LRA=11:TP=-1.5 output.mp3`, ((error, stdout, stderr) => {

            if (error) {
                console.error(`error: ${error}`);
                return;
            }

            // console.log(`stdout: ${stdout}`);
            // console.error(`stderr: ${stderr}`);

            const resource = voice.createAudioResource(fs.createReadStream("output.mp3"));

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
        }));
    });
}


async function churl(interaction, isJump) {

    let args = interaction.options.getString('網址');
    if (args === null) args = interaction.options.getString('預設');
    let i = 0;
    let tempList = [];

    if (ytpl.validateID(args)) {

        const ytplData = await ytpl(args, { limit: "Infinity" });

        for (i = 0; i < ytplData.items.length; i++) {

            if (isJump == true) {

                tempList.push({
                    name: ytplData.items[i].title,
                    url: ytplData.items[i].url,
                    time: ytplData.items[i].duration,
                    status: "normal",
                    user: interaction.user.username,
                    userId: interaction.user.id,
                    type: "wait",
                    id: ytplData.items[i].id
                });

            } else {

                tempList.push({
                    name: ytplData.items[i].title,
                    url: ytplData.items[i].url,
                    time: ytplData.items[i].duration,
                    status: "jump",
                    type: "wait",
                    user: interaction.user.username,
                    userId: interaction.user.id,
                    id: ytplData.items[i].id
                });

            }
        }

        client.channels.cache.get(interaction.channelId).send(`已從播放清單 ${ytplData.title} 新增` + " `" + i + "` " + "首歌");

    } else if (ytdl.validateURL(args)) {

        const res = await ytdl.getInfo(args);
        const info = res.videoDetails;

        if (isJump == true) {

            tempList.push({
                name: info.title,
                url: args,
                time: utils.getTime(info.lengthSeconds),
                status: "normal",
                type: "wait",
                user: interaction.user.username,
                userId: interaction.user.id,
                id: info.videoId
            });

            interaction.channel.send(`歌曲加入隊列:${info.title}`);
        } else {

            tempList.push({
                name: info.title,
                url: args,
                time: utils.getTime(info.lengthSeconds),
                status: "jump",
                type: "wait",
                user: interaction.user.username,
                userId: interaction.user.id,
                id: info.videoId
            });
            client.channels.cache.get(interaction.channel.id).send(`歌曲插入隊列:${info.title}`);

        }
    } else if (isPause) {
        pause(interaction);
    } else {
        client.channels.cache.get(interaction.channel.id).send(`查無此歌曲或歌單`);
        return;
    }

    if (!isJump) {
        tempList = tempList.reverse();
    }

    for (let k = 0; k < tempList.length; k++) {
        if (tempList[k].status === "jump") {
            list.splice(1, 0, tempList[k]);
            playlist.splice(1, 0, tempList[k]);
        }
    }

    if (isShuffle) {
        shuffleJoin(tempList);
    } else if (isJump) {
        list = list.concat(tempList);
        playlist = playlist.concat(tempList);
    }

    tempList = [];
    botJoinVoiceChannel(interaction);

    if (!isPlay) {
        playMusic(playlist[0].url, playlist[0].id);
        isPlay = true;
    }

}
function shuffleJoin(tempList) {

    tempList.sort(() => Math.random() - 0.5);
    let rd = 0;

    for (let k = 0; k < tempList.length; k++) {
        rd = Math.floor(Math.random() * shuffleList.length);
        shuffleList.splice(rd, 0, tempList[k]);
    }

    playlist = [];
    playlist = playlist.concat(shuffleList);
}

function shuffle(msg) {
    if (isShuffle == false) {
        if (list.length != 0) {
            let temp = [];
            let temp2 = [];
            playlist = [];
            shuffleList = [];
            temp = temp.concat(list);
            temp2 = temp.shift();
            temp.sort(() => Math.random() - 0.5);
            shuffleList = shuffleList.concat(temp);
            shuffleList.unshift(temp2);
            temp = [];
            temp2 = [];
            playlist = playlist.concat(shuffleList);
            isShuffle = true;
            msg.channel.send(`播放器將隨機播放本播放列表`);
        } else {
            isShuffle = true;
            msg.channel.send(`播放器將隨機播放本播放列表`);
        }

    } else {
        if (list.length != 0) {
            playlist = [];
            playlist = playlist.concat(list);;
            isShuffle = false;
            msg.channel.send(`播放器將不再隨機播放本播放列表`);
        } else {
            isShuffle = false;
            msg.channel.send(`播放器將不再隨機播放本播放列表`);
        }
    }
}

function playFinish(msg, user) {

    list = list.filter((a) => a.id !== playlist[0].id);
    playlist.shift();

    if (playlist.length > 0) {
        playMusic(playlist[0].url);
    } else {
        msg.channel.send('目前沒有音樂了，請加入音樂 :D');
    }
}

/**
 * Game handlers
 */
let gameMember = [];
function game(interaction, number) {

    let rd;

    for (let i = 0; i < gameMember.length; i++) {

        if (gameMember[i].player === interaction.user.username) {
            if (number === gameMember[i].rdNumber) {
                // console.log('1');
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`恭喜 <@${gameMember[i].playerId}> 回答正確，答案是 ${"**"}${gameMember[i].rdNumber}${"**"} `);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
                gameMember.splice(i, 1);
            } else if (gameMember[i].frequency < 2) {
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`噗噗~ <@${gameMember[i].playerId}>你選的 ${"**"}${number}${"**"} 是錯的\n好菜喔~答案是 ${"**"}${gameMember[i].rdNumber}${"**"}\n這樣都猜不到！`);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
                gameMember.splice(i, 1);
            } else if (number > gameMember[i].rdNumber) {
                // console.log('2');
                gameMember[i].frequency--;
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`<@${gameMember[i].playerId}> 可惜，正確答案比 ${"**"}${number}${"**"} ${"`"}小${"`"}\n你還剩 ${"**"}${gameMember[i].frequency}${"**"} 次機會。`);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
            } else if (number < gameMember[i].rdNumber) {
                // console.log('3');
                gameMember[i].frequency--;
                const embed = new MessageEmbed()
                    .setTitle('數字猜猜樂')
                    .setColor(0xFF60AF)
                    .setDescription(`<@${gameMember[i].playerId}> 可惜，正確答案比 ${"**"}${number}${"**"} ${"`"}大${"`"}\n你還剩 ${"**"}${gameMember[i].frequency}${"**"} 次機會。`);
                client.channels.cache.get(interaction.channel.id).send({ embeds: [embed] });
            }
            return;
        }
    }

    rd = Math.floor(Math.random() * 99) + 1;
    // console.log(rd);
    gameMember.push({
        rdNumber: rd,
        player: interaction.user.username,
        playerId: interaction.user.id,
        frequency: 5
    });
    game(interaction, number)
}

client.login(config.Token1 + config.Token2);