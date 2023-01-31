const fs = require("fs")
const chalk = require("chalk")
const axios = require("axios")
const { checkDataId, getBuffer } = require("@libs")
module.exports = {
    commands: ["punch"],
    cooldown: 10,
    isSewa: true,
    isBlockCmd: checkDataId("blockcmd", "punch", db.data), 
    isOwner: checkDataId("owner", "punch", db.data), 
    isPremium: checkDataId("premium", "punch", db.data),
    isLimit: checkDataId("limit", "punch", db.data),
    isWait: true, 
    callback: async (sock, m, { prefix, command, setQuoted }) => {
        var { data } = await axios.get("https://anime-api.hisoka17.repl.co/img/punch")
        var buffer = await getBuffer(data.url)
        var buttons = [{ buttonId: `${prefix + command}`, buttonText: { displayText: `➡️Next` }, type: 1 }]        
        if (data.url.includes(".jpg") || data.url.includes(".jpeg") || data.url.includes(".png")) {
        try{
        sock.sendMessage(m.chat, { image: data, buttons }, { quoted: setQuoted })
        } catch {
        sock.sendMessage(m.chat, { image: buffer, buttons }, { quoted: setQuoted })
        }
        } else if (data.url.includes(".gif") || data.url.includes(".mp4")) {
        try{
        sock.sendMessage(m.chat, { video: data, buttons }, { quoted: setQuoted })
        } catch {
        sock.sendMessage(m.chat, { video: buffer, buttons }, { quoted: setQuoted })
        }
        }
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})