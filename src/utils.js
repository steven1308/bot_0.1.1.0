function time() {
    const date = new Date();
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

function getTime(seconds) {
    let h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    let m = Math.floor((seconds / 60 % 60)).toString().padStart(2, "0");
    let s = Math.floor((seconds % 60)).toString().padStart(2, "0");
    if (h > 0) {
        return h + ":" + m + ":" + s;
    } else {
        return m + ":" + s;
    }
}

function mintosec(min) {
    let c

    let timeArray = min.split(":");

    if (timeArray.length === 3) {
        c = Number(timeArray[0]) * 3600 + Number(timeArray[1]) * 60 + Number(timeArray[2]);


    } else {
        c = Number(timeArray[0]) * 60 + Number(timeArray[1]);

    }

    return c;

}
// function command(msg, command, config) {

//     if (command === config.ping) {
//         command = 'ping';
//     } else if (msg.member.voice.channelID === null) {
//         command = 'notjoin';
//     } else if (command === config.join) {
//         command = 'join';
//     } else if (command === config.shutdown) {
//         command = 'shutdown';
//     } else if (command === config.play) {
//         command = 'play';
//     } else if (command === config.shuffle) {
//         command = 'shuffle';
//     } else if (command === config.skip) {
//         command = 'skip';
//     } else if (command === config.playnow) {
//         command = 'playnow';
//     }
//     return command;
// }


module.exports = { time, getTime, mintosec };
