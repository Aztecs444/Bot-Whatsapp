const fs = require("fs")
const chalk = require("chalk")
const i18n = require("i18n")
const { checkDataId } = require("@libs")
module.exports = {
    commands: ["getfitur"],
    cooldown: 10,
    isSewa: true,
    isBlockCmd: checkDataId("blockcmd", "getfitur", db.data), 
    isOwner: checkDataId("owner", "getfitur", db.data), 
    isPremium: checkDataId("premium", "getfitur", db.data),
    isLimit: checkDataId("limit", "getfitur", db.data),
    callback: async (sock, m, { text, setQuoted, setReply }) => {
        if (!Object.keys(db.allcommand).includes(text)) return setReply(i18n.__("command.not_found", { command: text } ))
        sock.sendMessage(m.chat, { document: file, mimetype: "application/bin", fileName: `${text}.js` }, { quoted: setQuoted })
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})