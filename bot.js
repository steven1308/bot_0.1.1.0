const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const config = require(`${__dirname}/config.json`);
const delight = require("./delight.js");
const client = new Discord.Client();
let connection;
let dispatcher;
let list = [];
client.login(config.Token);
client.on("ready", () => {
    client.channels.cache.get(config.channel).send("bot is online");
    console.log(`bot is online ${client.user.tag}!`);
});
client.on("voiceStateUpdate", (oldState, newState) => {

    if (newState.member.user.bot && newState.channel === null) {
        list = [];
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

    /**
     * 趣味
     */
    delight(msg, client);
    
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
    } else if (command === config.play) {
        command = 'play';
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

           await churl(msg, args[0],true);

            if (connection === undefined) {
                connection = await msg.member.voice.channel.join();
            }

            if (!isplay) {
                playMusic(msg, list[0].url);
                isplay = true;
            }

            break;
        case 'pn':

            churl(msg, args[0],false);

            break;
            case "skip":
            if(list.length>0){
                msg.channel.send(`已跳過 `);
                dispatcher.end();
            }else{
                
                msg.channel.send(`播放序列是空的!`);
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

function playMusic(msg, url) {

    dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));
    dispatcher.setVolume(0.06);
    
    dispatcher.on('finish', () => {
        list.shift();
        if (list.length > 0) {
            playMusic(msg, list[0].url);
           
        } else {
            isplay = false;
            msg.channel.send('目前沒有音樂了，請加入音樂 :D');
        }
    });

    return dispatcher;
}

function getTime(seconds) {
    let h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    let m = Math.floor((seconds / 60 % 60)).toString().padStart(2, "0");
    let s = Math.floor((seconds % 60)).toString().padStart(2, "0");
    if (h >= 0) {
        return m + ":" + s;
    } else {
        return h + ":" + m + ":" + s;
    }
}

async function churl(msg, args, ck) {

    let i = 0;

    if (ytpl.validateID(args)) {
        
        const playlist = await ytpl(args, { limit: "Infinity" });

        for (i = 0; i < playlist.items.length; i++) {
            if (ck) {
                list.push({
                    name: playlist.items[i].title,
                    url: playlist.items[i].url,
                    time: playlist.items[i].duration,
                    status: "normal"
                })
                msg.channel.send(`已從播放清單 ${playlist.title} 新增` + " `" + i + "` " + "首歌");
            } else {
                    list.unshift({
                        name: playlist.items[i].title,
                        url: playlist.items[i].url,
                        time: playlist.items[i].duration,
                        status: "jump"
                    })

            }
                msg.channel.send(`已插播播放清單 ${playlist.title} ` + " `" + i + "` " + "首歌");
        }

        } else if (ytdl.validateURL(args)) {

            const res = await ytdl.getInfo(args);
            const info = res.videoDetails;

        if(ck){

            list.push({
                name: info.title,
                url: args,
                time: getTime(info.lengthSeconds),
                status: "normal"
            });

            msg.channel.send(`歌曲加入隊列：${info.title}`);
        }else{
            
            list.unshift({
                name: info.title,
                url: args,
                time: getTime(info.lengthSeconds),
                status: "jump"
            });

            msg.channel.send(`歌曲差入隊列：${info.title}`);
            console.log(list);
        }
        } else {
            msg.channel.send(`查無此歌曲或歌單`);
            return;
        }
}