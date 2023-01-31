const { readFileSync } = require("fs")
const options = JSON.parse(readFileSync("./settings.json"))
module.exports = {
	ownerNumber: options.ownerNumber, 
	ownerName: options.ownerName,
	botName: options.botName,
	copyright: options.copyright, 
	runWith: options.runWith,
	limitAwal: options.limitAwal
};