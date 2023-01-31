require("module-alias/register")
const i18n = require("i18n")
const path = require("path")

i18n.configure({
    locales: ["mess"],
    defaultLocale: "mess",
    autoReload: true,
    directory: path.join(__dirname, "config", "locales"),
    objectNotation: true,
})

const { connectToWhatsApp } = require("./index")

connectToWhatsApp()

process.on("uncaughtException", function (err) {
    console.log("Caught exception: ", err)
})
