const express = require("express")
const path = require("path")
const app = express()
const port = 3000
const appRouting = require("./routers/app-route")

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use("/assets",express.static(path.join(__dirname, "assets")))

app.use("/", appRouting)

app.listen(port, () => console.log(`Bot running on http://localhost:${port}`))

module.exports= app