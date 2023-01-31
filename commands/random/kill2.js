const fs = require("fs")
const chalk = require("chalk")
const axios = require("axios")
const { checkDataId, getBuffer } = require("@libs")
module.exports = {
    commands: ["kill2"],
    cooldown: 10,
    isSewa: true,
    isBlockCmd: checkDataId("blockcmd", "kill2", db.data), 
    isOwner: checkDataId("owner", "kill2", db.data), 
    isPremium: checkDataId("premium", "kill2", db.data),
    isLimit: checkDataId("limit", "kill2", db.data),
    isWait: true, 
    callback: async (sock, m, { prefix, command, setQuoted }) => {
        var { data } = await axios.get("https://waifu.pics/api/sfw/kill")
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