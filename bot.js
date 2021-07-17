const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const ytpl = require("ytpl");
const config = require(`${__dirname}/config.json`);
const delight = require("./delight.js");
const ping = require("./src/ping.js");
const Record = require("./src/Record.js");
const utils = require("./src/utils.js")
let shuffleck = false;
let shufflelist = [];
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

    Record(client, config, oldState, newState);

});
let isplay = false;
client.on("message", async (msg) => {

    if (msg.author.bot) return;

    /**
     * 趣味 :)
     */
    delight(msg, client);

    if (!msg.content.startsWith(config.Prefix)) return;
    let command = msg.content.split(" ")[0].replace(config.Prefix, "").toLowerCase(); // ?ping www -> ["?ping", "www"]
    let args = msg.content.split(" ").slice(1);
    command = utils.command(msg, command, config);
    switch (command) {
        case 'ping':
            ping(msg, args[1], args[0], client, config);
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
        case 'list':
            queue(msg, args[0]);
            break;
        case 'play':
            await churl(msg, args[0], true);
            break;
        case 'pn':
            churl(msg, args[0], false);
            break;
        case 'shuffle':


            shuffle();

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
            client.channels.cache.get(msg.channel.id).send("err");

            break;
    }
});
function queue(msg, cord1) {
    if (list.length === 0) {
        client.channels.cache.get(msg.channel.id).send('歌單是空的');
        return;
    }

    if (shuffleck === true) {
        listch = shufflelist;
    } else {
        listch = list;
    }

    let queue = [];
    let i = 0, b;
    let a = listch.length / 10;
    let atime = 0;
    if (listch.length > config.listmax) {
        d = config.listmax;
    } else {
        d = listch.length
    }
    console.log(cord1);
    if (cord1 === undefined||cord1==='1') {
        i = 0;
        cord1 = 0;
        b = `${i / 10 + 1}/${Math.round(a) + 1}頁`;
    } else {

        if (cord1 <= Math.round(a) + 1) {
            i = (cord1 - 1) * 10;

            b = `${cord1}/${Math.round(a) + 1}頁`;
            cord1 =i;
        }
    }
    console.log(cord1);
    for (k = 0; i <  cord1+ config.listmax; i++, k++) {
        if (listch[i] !== undefined) {
            if (listch[i].type === "play") {
                queue[k] = "`[" + `${(i + 1).toString().padStart(2, "0")}` + "] ` ▶ " + `${listch[i].name}` + "`" + ` ${listch[i].time}` + "`" + `由 ${listch[i].user} 加入`

            } else {

                queue[k] = "`[" + `${(i + 1).toString().padStart(2, "0")}` + "]`" + `${listch[i].name}` + "`" + ` ${listch[i].time}` + "`" + `由 ${listch[i].user} 加入`
            }
        }
    }

    queue.unshift(b);

    for (let i = 0; i < listch.length; i++) {

        atime += utils.mintosec(listch[i].time);

    }
    atime = utils.getTime(atime);

    queue.push(`序列中目前有 ${listch.length} 個 曲目 ，長度是 [${atime}]`)

    client.channels.cache.get(msg.channel.id).send(queue);
// console.log(queue); 
}

function playMusic(msg, url) {

    dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));
    list[0].type = "play";
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
                    status: "normal",
                    user: msg.author.username,
                    type: "wait",
                    id: playlist.id
                })

            } else {
                list.unshift({
                    name: playlist.items[i].title,
                    url: playlist.items[i].url,
                    time: playlist.items[i].duration,
                    status: "jump",
                    type: "wait",
                    user: msg.author.username,
                    id: playlist.id
                })

            }
        }

        msg.channel.send(`已從播放清單 ${playlist.title} 新增` + " `" + i + "` " + "首歌");

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
                user: msg.author.username,
                id: playlist.id
            });

            msg.channel.send(`歌曲加入隊列：${info.title}`);
        } else {

            list.unshift({
                name: info.title,
                url: args,
                time: utils.getTime(info.lengthSeconds),
                status: "jump",
                type: "wait",
                user: msg.author.username,
                id: playlist.id
            });

            msg.channel.send(`歌曲差入隊列：${info.title}`);
        }
    } else {
        msg.channel.send(`查無此歌曲或歌單`);
        return;
    }
    if (connection === undefined) {
        connection = await msg.member.voice.channel.join();
    }

    if (!isplay) {
        playMusic(msg, list[0].url);
        isplay = true;
    }
    if (shuffleck === true) {
        shuffleck = false;
        shufflec();
    }
}

function shuffle() {
    if (shuffleck === false) {
        let list1 = list;
        for (i = 0; i < list.length; i++) {
            let w = Math.floor(Math.random() * list1.length - i);
            shufflelist[i] = list1[w];
            list1.splice(w, 1);

        }
        shuffleck = true;
    } else {
        shufflelist = [];
        shuffleck = false;
    }

    msg.channel.send(`清單以隨機撥放`);






}