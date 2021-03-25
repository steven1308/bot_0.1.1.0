module.exports = delight = async (msg, client) => {
    if(msg.content.toLowerCase() === "Hi Bot".toLowerCase()) {

        await msg.delete();

        let message = await msg.reply("叫三小啦!!!");

        // setTimeout(() => {
        //     message.edit("🖕");

        //     setTimeout(async () => {
        //         message.channel.bulkDelete(1);

        //         let channel = await client.channels.fetch("381392874404577282");
        //         let webhooks = await channel.fetchWebhooks();
        //         let webhook = webhooks.find((hook) => hook.name === "Captain Hook");

        //         if(webhook !== undefined) {
        //             setTimeout(() => {
        //                 webhook.send("你看看我是誰?", {
        //                     username: msg.author.username,
        //                     avatarURL: msg.author.avatarURL()
        //                 });

        //                 setTimeout(() => {
        //                     webhook.send("是你🤣哈哈!!!", {
        //                         username: msg.author.username,
        //                         avatarURL: msg.author.avatarURL()
        //                     });

        //                     setTimeout(() => {
        //                         webhook.send("我可以用這分身做壞事，別惹到我窩😈拜拜💗", {
        //                             username: msg.author.username,
        //                             avatarURL: msg.author.avatarURL()
        //                         });

        //                         setTimeout(() => {
        //                             msg.channel.bulkDelete(3);
        //                         }, 4000);
        //                     }, 2000);
        //                 }, 2000);
        //             }, 1000);
        //         }
        //     }, 1500);
        // }, 2000);

    }else if(msg.content === "踢我啊廢物"){

        msg.reply("這種要求我從沒見過!?");

        setTimeout(() => {
            msg.reply("好啊!!!");
            msg.member.voice.kick();
        }, 10000);

    }
}