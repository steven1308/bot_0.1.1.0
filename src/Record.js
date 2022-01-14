const Discord = require("discord.js");
const utils = require("./utils.js")


module.exports = Record = async (client, config, oldState, newState) => {

    const channel = client.channels.cache.get(config.channel);
    let n = [newState.member.user.username, newState.selfDeaf, newState.selfMute, newState.streaming, newState.channel];
    let o = [oldState.member.user.username, oldState.selfDeaf, oldState.selfMute, oldState.streaming, oldState.channel];
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
        .setDescription(`時間:${utils.time()}\n名稱:${n[0]}\n拒聽:${n[1]} \n靜音:${n[2]}\n直播:${n[3]}\n頻道: ${n[4]}`);

    channel.send({embeds: [embed]});
}