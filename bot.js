const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const config = require(`${__dirname}/config.json`);
const client = new Discord.Client();
let connection;
let queue = [];
client.login(config.Token);
client.on("ready", () => {
    client.channels.cache.get(config.channel).send("bot is online");
    console.log(`bot is online ${client.user.tag}!`);
});
client.on("voiceStateUpdate", (oldState, newState) => {

    if (newState.member.user.bot && newState.channel === null) {
        queue = [];
        connection = undefined;
    }

    const channel = client.channels.cache.get(config.channel);
    let n = [newState.member.user.username, newState.selfDeaf, newState.selfMute, newState.streaming, newState.channel]
    let o = [oldState.member.user.username, oldState.selfDeaf, oldState.selfMute, oldState.streaming, oldState.channel]
    let ch = true;
    for (let i = 1; i < n.length - 1; i++) {
        if (n[i] !== o[i]) {
            ch = false;
            n[i] = n[i] ? "是" + "<-" : "否" + "<-";
        } else {
            n[i] = n[i] ? "是" : "否";
        }
    }
    if (n[4] === null) {
        n[4] = "從 " + o[4].name + " 離開了 <-"
    } else if (o[4] === null) {
        n[4] = "加入 " + n[4].name + " <-";
    } else if (n[4] === o[4] && ch) {
        n[4] = n[4].name + " <-"
    } else if (n[4] !== o[4]) {
        n[4] = o[4].name + " 到 " + n[4].name + " <-";
    }


    const embed = new Discord.MessageEmbed()

        .setTitle('語音頻道紀錄')

        .setColor(0xFF60AF)

        .setDescription(`時間:${time()}\n名稱:${n[0]}\n拒聽:${n[1]} \n靜音:${n[2]}\n直播:${n[3]}\n頻道: ${n[4]}`);

    channel.send(embed);
});
let isplay = false;
client.on("message", async (msg) => {

    if (msg.author.bot) return;



    if (!msg.content.startsWith(config.Prefix)) return;
    let command = msg.content.split(" ")[0].replace(config.Prefix, "").toLowerCase(); // ?ping www -> ["?ping", "www"]
    let args = msg.content.split(" ").slice(1);



    if (command === config.ping) {
        command = 'ping';
    } else if (msg.member.voice.channelID === null) {

        command = 'notjoin';
    } else if (command === config.join) {
        command = 'join';

    } else if (command === config.shutdown) {
        command = 'shutdown';
    }


    switch (command) {
        case 'ping':
            let a = 1, c = 0, d = 0;
            if (args[2] >= 6) {
                a = args[2] / 5;
                c = 5;
                args[2] = args[2] % 5;
            } else if (args.length === 1) {
                args[2] = 1;
            }
            for (let b = 0; b < parseInt(a); b++) {
                for (let i = 0; i < c; i++) {
                    client.channels.cache.get(config.pingchannel).send(args[0]);
                    d++;
                }
            }
            for (let i = 0; i < args[2]; i++) {
                client.channels.cache.get(config.pingchannel).send(args[0]);
                d++;
            }
            break;
        case 'join':
            connection = await msg.member.voice.channel.join();
            break;
        case 'shutdown':
            msg.member.voice.channel.leave();
            break;
        case 'notjoin':
            msg.channel.send('請先加入頻道');

            break;
        case 'play':
            const res = await ytdl.getInfo(args[0]);
            const info = res.videoDetails;

            queue.push({
                name: info.title,
                url: args[0]
            });

            if (connection === undefined) {
                connection = await msg.member.voice.channel.join();
            }

            if (isplay) {
                msg.channel.send(`歌曲加入隊列：${info.title}`);
            } else {
                playMusic(msg, args[0]);
                isplay = true;
            }

            break;
        default:
            client.channels.cache.get(msg.channel.id).send("err");
            break;
    }


});

function time() {
    const date = new Date();
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

let v = 0.02;

function playMusic(msg, url) {

    let dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));

    
    dispatcher.setVolume(v += 0.01);
    

    queue.shift();

    dispatcher.on('finish', () => {

        console.log(queue);

        if (queue.length > 0) {
            playMusic(msg, queue.shift().url);
            
        } else {
            isplay = false;
            msg.channel.send('目前沒有音樂了，請加入音樂 :D');
        }
    });

    return dispatcher;
}

// function join(msg) {
//     msg.member.voice.channel.join();
// }


// if (this.isPlaying) {
//     msg.channel.send(`歌曲加入隊列：${info.title}`);
// } else {
//     this.isPlaying = true;
//     this.playMusic(msg, guildID, this.queue[guildID][0]);
// }





// playMusic(msg, guildID, musicInfo) {

//     // 提示播放音樂
//     msg.channel.send(`播放音樂：${musicInfo.name}`);

//     // 播放音樂
//     this.dispatcher[guildID] = this.connection[guildID].play(ytdl(musicInfo.url, { filter: 'audioonly' }));

//     // 把音量降 50%，不然第一次容易被機器人的音量嚇到 QQ
//     this.dispatcher[guildID].setVolume(0.5);

//     // 移除 queue 中目前播放的歌曲
//     this.queue[guildID].shift();

//     // 歌曲播放結束時的事件
//     const self = this;
//     this.dispatcher[guildID].on('finish', () => {

//         // 如果隊列中有歌曲
//         if (self.queue[guildID].length > 0) {
//             self.playMusic(msg, guildID, self.queue[guildID].shift());
//         } else {
//             self.isPlaying = false;
//             msg.channel.send('目前沒有音樂了，請加入音樂 :D');
//         }

//     });

// }