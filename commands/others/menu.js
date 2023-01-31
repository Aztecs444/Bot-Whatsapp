const fs = require("fs")
const chalk = require("chalk")
const { checkDataId } = require("@libs")
module.exports = {
    commands: ["menu"],
    cooldown: 10,
    isSewa: true,
    isBlockCmd: checkDataId("blockcmd", "menu", db.data), 
    isOwner: checkDataId("owner", "menu", db.data), 
    isPremium: checkDataId("premium", "menu", db.data),
    isLimit: checkDataId("limit", "menu", db.data),
    callback: async (sock, m, { thePrefix, listblock }) => {
        //setReply(`*_${moment.duration(Date.now() - parseInt(m.messageTimestamp.toString()) * 1000).asSeconds()} second_*`)
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})