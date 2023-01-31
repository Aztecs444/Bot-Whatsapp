const {
    BufferJSON,
    Browsers,
    initInMemoryKeyStore,
    DisconnectReason,
    AnyMessageContent,
    makeInMemoryStore,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} = require("@adiwajshing/baileys")
const fs = require("fs")
const chalk = require("chalk")
const pino = require("pino")
const libs = require("@libs")
const config = require("@config") 
const { Boom } = require("@hapi/boom")
const Spinnies = require("spinnies");
const spinnies = new Spinnies({spinner: { interval: 200, frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"] }})
const { color } = libs
const { handler } = require("@messages")
//=================================================//
global.db = JSON.parse(fs.readFileSync("./database/database.json"))
global.db = {
    allcommand: {},
    anonymous: [],
    audio: {},
    banned: {},
    chats: {},
    cooldown: {}, 
    dashboard: {},
    data: [],
    database: {},
    expired: {},
    listerror: [],
    menfes: [],
    settings: {},
    sticker: {},
    users: {},
    ...(global.db || {})
}
setInterval(() => {
fs.writeFileSync("./database/database.json", JSON.stringify(global.db, null, 2))
}, 30 * 1000)
//=================================================//
if (config.runWith.includes("eplit")) {
    const { app } = require("./src/keepalive")
}
//=================================================//
const connectToWhatsApp = async() => {

const { state, saveCreds } = await useMultiFileAuthState("./connections/session")
const { version, isLatest } = await fetchLatestBaileysVersion()
const store = makeInMemoryStore({ logger: pino().child({ level: "fatal", stream: "store" }) })
//=================================================//
const connectionOptions = {
printQRInTerminal: true,
logger: pino({ level: "fatal" }),
auth: state,
browser: ["Whatsapp-Botz", "IOS", "4.1.0"],
version,
}
//=================================================//
const sock = libs.makeWASocket(connectionOptions)
store.bind(sock.ev)
//=================================================//
sock.ev.on("connection.update", async (update) => {
const { connection, lastDisconnect } = update
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (connection === "close") {
console.log(color(lastDisconnect.error, "deeppink"))
if (lastDisconnect.error == "Error: Stream Errored (unknown)") {
process.exit()
} else if (reason === DisconnectReason.badSession) {
console.log(color(`Bad Session File, Please Delete Session and Scan Again`))
process.exit()
} else if (reason === DisconnectReason.connectionClosed) {
console.log(color("[SYSTEM]", "white"), color("Connection closed, reconnecting...", "deeppink"))
process.exit()
} else if (reason === DisconnectReason.connectionLost) {
console.log(color("[SYSTEM]", "white"), color("Connection lost, trying to reconnect", "deeppink"))
process.exit()
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(color("Connection Replaced, Another New Session Opened, Please Close Current Session First"))
sock.logout()
} else if (reason === DisconnectReason.loggedOut) {
console.log(color(`Device Logged Out, Please Scan Again And Run.`))
sock.logout()
} else if (reason === DisconnectReason.restartRequired) {
console.log(color("Restart Required, Restarting..."))
await connectToWhatsApp()
} else if (reason === DisconnectReason.timedOut) {
console.log(color("Connection TimedOut, Reconnecting..."))
connectToWhatsApp()
}
} else if (connection === "connecting") {
spinnies.add("spinner-2", { text: "Connecting to the WhatsApp bot...", color: "cyan" })
} else if (connection === "open") {
spinnies.succeed("spinner-2", { text: "Successfully connected to whatsapp", color: "green" })
}
})
//=================================================//
sock.ev.on("messages.upsert", async (chatUpdate) => {
try {
if (!chatUpdate.messages) return
var m = chatUpdate.messages[0] || chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m.message) return
if (m.key && m.key.remoteJid === "status@broadcast") return
if (m.key.id.startsWith("BAE5") && m.key.id.length === 16) return
m = libs.smsg(sock, m, store)
handler(sock, m, chatUpdate, store) 
} catch (err) {
console.log(err)
}
})
//=================================================//
sock.ev.on("creds.update", saveCreds)
return sock
}
//=================================================//
module.exports = { connectToWhatsApp }




let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})

