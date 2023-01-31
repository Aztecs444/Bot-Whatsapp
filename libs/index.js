const base = require("./base")
const func = require("./function") 
module.exports = {
	makeWASocket: base.makeWASocket, 
	smsg: base.smsg, 
	color: func.color, 
	bgcolor: func.bgcolor,
	clearAllData: func.clearAllData, 
	checkErrorData: func.checkErrorData, 
	checkErrorCmd: func.checkErrorCmd, 
	addError: func.addError, 
	checkDataName: func.checkDataName, 
	createDataId: func.createDataId, 
	getDataId: func.getDataId, 
	addDataId: func.addDataId, 
	removeDataId: func.removeDataId, 
	checkDataId: func.checkDataId, 
	calender: func.calender, 
	getBuffer: func.getBuffer
}