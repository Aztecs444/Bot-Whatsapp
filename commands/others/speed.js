const moment = require("moment-timezone")
const fs = require("fs")
const chalk = require("chalk")
const { checkDataId } = require("@libs")
module.exports = {
    commands: ["speed"],
    cooldown: 10,
    isSewa: true,
    isBlockCmd: checkDataId("blockcmd", "speed", db.data), 
    isOwner: checkDataId("owner", "speed", db.data), 
    isPremium: checkDataId("premium", "speed", db.data),
    isLimit: checkDataId("limit", "speed", db.data),
    callback: async (sock, m, { setReply }) => {
        setReply(`*_${moment.duration(Date.now() - parseInt(m.messageTimestamp.toString()) * 1000).asSeconds()} second_*`)
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})