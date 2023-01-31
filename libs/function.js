const chalk = require("chalk") 
const fs = require("fs") 
const axios = require("axios")
const color = (text, color) => {
return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

const clearAllData = (data) => {
        Object.keys(data).forEach((x) => {
        data.splice(data[x], 1)
        })
}

const checkErrorData = (command, data) => {
        let status = false
        Object.keys(data).forEach((x) => {
        if (data[x].error === command) {
        status = true
        }
        })
        return status
}

const checkErrorCmd = (command, data) => {
        let status = false
        Object.keys(data).forEach((x) => {
        if (data[x].cmd === command) {
        status = true
        }
        })
        return status
}

const addError = (command, msg, data) => {
        const obj = {
        cmd: command,
        error: msg,
        }
        data.push(obj)
}

const checkDataName = (name, data) => {
        let status = false
        Object.keys(data).forEach((x) => {
        if (data[x].name === name) {
        status = true
        }
        })
        return status
}

const createDataId = (name, data) => {                                                                                                                      
        const obj = { 
        name: name, 
        id: [] 
        }
        data.push(obj)
}

const getDataId = (name, data) => {
        let position = false
        Object.keys(data).forEach((x) => {
        if (data[x].name === name) {
        position = x
        }
        })
        if (position !== false) {
        return data[position].id
        }
}

const addDataId = (nama, id, data) => {
        let found = false
        Object.keys(data).forEach((x) => {
        if (data[x].name == nama){
        found = x
        }
        })
        if (found !== false) {
        data[found].id.push(id)
        }
}

const removeDataId = (nama, id, data) => {
        let found = false
        Object.keys(data).forEach((x) => {
        if (data[x].name == nama){
        found = x
        }
        })
        if (found !== false) {
        data[found].id.splice(data[found].id.indexOf(id, 1))
        }
}

const checkDataId = (nama, id, data) => {
        let found = false
        let status = false
        Object.keys(data).forEach((x) => {
        if (data[x].name == nama){
        found = x
        }
        })
        if (found !== false) {
        for (let indexs of data[found].id){
        if (indexs == id){
        status = true
        }
        }
        }
        return status
}

const calender = new Date.toLocaleDateString("id", { day: "numeric", month: "long", year: "numeric" })

const getBuffer = async (url, options) => {
try {
options ? options : {}
const res = await axios({method: "get", url, headers: { "DNT": 1,
"Upgrade-Insecure-Request": 1
},
...options,
responseType: "arraybuffer"
})
return res.data
} catch {
//console.log(e)
}
}


module.exports = {
  color,
  bgcolor,  
  clearAllData, 
  checkErrorData, 
  checkErrorCmd, 
  addError, 
  checkDataName, 
  createDataId, 
  getDataId, 
  addDataId, 
  removeDataId, 
  checkDataId,
  calender, 
  getBuffer
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})