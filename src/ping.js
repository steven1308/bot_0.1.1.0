
module.exports = ping = async (msg, cord1,cord2,client,config) => {

let a = 1, c = 0, d = 0;
if (cord1 >= 6) {
    a = cord1 / 5;
    c = 5;
    cord1 = cord1 % 5;
} 
else if (cord1 === undefined) {
    cord1 = 1;
}
for (let b = 0; b < parseInt(a); b++) {
    for (let i = 0; i < c; i++) {
        client.channels.cache.get(config.pingchannel).send(cord2);
        
    }
}
console.log("1");
for (let i = 0; i < cord1; i++) {
    client.channels.cache.get(config.pingchannel).send(cord2);
  
}
}