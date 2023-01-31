const {
    default: makeWASocket,
    makeWALegacySocket,
    extractMessageContent,
    makeInMemoryStore,
    proto,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateWAMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    getContentType,
    relayMessage,
    WA_DEFAULT_EPHEMERAL
} = require("@adiwajshing/baileys")
const pino = require("pino")
const chalk = require("chalk")
const fs = require("fs")
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) })

exports.makeWASocket = (connectionOptions, options = {}) => {
const sock = makeWASocket(connectionOptions)

sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
}

sock.loadMessage = (messageID) => {
        return Object.entries(sock.chats)
        .filter(([_, { messages }]) => typeof messages === 'object')
        .find(([_, { messages }]) => Object.entries(messages)
        .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
        ?.[1].messages?.[messageID]
}

sock.insertAllGroup = async() => {
        const groups = await sock.groupFetchAllParticipating().catch(_ => null) || {}
        for (const group in groups) sock.chats[group] = { ...(sock.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
        return sock.chats
}

sock.getName = async (jid = '', withoutContact = false) => {
        jid = sock.decodeJid(jid)
        withoutContact = sock.withoutContact || withoutContact
        let v
        if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
        v = sock.chats[jid] || {}
        if (!(v.name || v.subject)) v = await sock.groupMetadata(jid) || {}
        resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = jid === '0@s.whatsapp.net' ? {
        jid,
        vname: 'WhatsApp'
        } : areJidsSameUser(jid, sock.user.id) ?
        sock.user :
        (sock.chats[jid] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international').replace(new RegExp("[()+-/ +/]", "gi"), "") 
}

sock.downloadM = async (m, type, filename = '') => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
        }
        if (filename) await fs.promises.writeFile(filename, buffer)
        return filename && fs.existsSync(filename) ? filename : buffer
}

sock.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
        let m = generateForwardMessageContent(message, !!forwardingScore)
        let mtype = Object.keys(m)[0]
        if (forwardingScore && typeof forwardingScore == 'number' && forwardingScore > 1) m[mtype].contextInfo.forwardingScore += forwardingScore
        m = generateWAMessageFromContent(jid, m, { ...options, userJid: sock.user.id })
        await sock.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
        return m
}

sock.processMessageStubType = async(m) => {
        if (!m.messageStubType) return
        const chat = sock.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
        if (!chat || chat === 'status@broadcast') return
        const emitGroupUpdate = (update) => {
        ev.emit('groups.update', [{ id: chat, ...update }])
        }
        switch (m.messageStubType) {
        case WAMessageStubType.REVOKE:
        case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
        emitGroupUpdate({ revoke: m.messageStubParameters[0] })
        break
        case WAMessageStubType.GROUP_CHANGE_ICON:
        emitGroupUpdate({ icon: m.messageStubParameters[0] })
        break
        default: {
        console.log({
        messageStubType: m.messageStubType,
        messageStubParameters: m.messageStubParameters,
        type: WAMessageStubType[m.messageStubType]
        })
        break
        }
        }
        const isGroup = chat.endsWith('@g.us')
        if (!isGroup) return
        let chats = sock.chats[chat]
        if (!chats) chats = sock.chats[chat] = { id: chat }
        chats.isChats = true
        const metadata = await sock.groupMetadata(chat).catch(_ => null)
        if (!metadata) return
        chats.subject = metadata.subject
        chats.metadata = metadata
}




Object.defineProperty(sock, 'name', {
value: { ...(options.chats || {}) },
configurable: true,
})
if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id)
store.bind(sock.ev)
return sock
}



exports.smsg = (sock, m, hasParent) => {
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    if (m.key) {
    m.id = m.key.id
    m.isBaileys = m.id && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || false
    m.chat = sock.decodeJid(m.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
    m.now = m.messageTimestamp
    m.isGroup = m.chat.endsWith('@g.us')
    m.sender = sock.decodeJid(m.key.fromMe && sock.user.id || m.participant || m.key.participant || m.chat || '')
    m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, sock.user.id)
    }
    if (m.message) {
    let mtype = Object.keys(m.message)
    m.mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype[0]) && mtype[0]) || // Sometimes message in the front
    (mtype.length >= 3 && mtype[1] !== 'messageContextInfo' && mtype[1]) || // Sometimes message in midle if mtype length is greater than or equal to 3!
    mtype[mtype.length - 1] // common case
    m.type = getContentType(m.message)
    m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.type])
    if (m.chat == 'status@broadcast' && ['protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) m.chat = (m.key.remoteJid !== 'status@broadcast' && m.key.remoteJid) || m.sender
    if (m.mtype == 'protocolMessage' && m.msg.key) {
    if (m.msg.key.remoteJid == 'status@broadcast') m.msg.key.remoteJid = m.chat
    if (!m.msg.key.participant || m.msg.key.participant == 'status_me') m.msg.key.participant = m.sender
    m.msg.key.fromMe = sock.decodeJid(m.msg.key.participant) === sock.decodeJid(sock.user.id)
    if (!m.msg.key.fromMe && m.msg.key.remoteJid === sock.decodeJid(sock.user.id)) m.msg.key.remoteJid = m.sender
    }
    m.text = m.msg || ''
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid?.length && m.msg.contextInfo.mentionedJid || []
    let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null
    if (m.quoted) {
    let type = Object.keys(m.quoted)[0]
    m.quoted = m.quoted[type]
    if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
    m.quoted.mtype = type
    m.quoted.id = m.msg.contextInfo.stanzaId
    m.quoted.chat = sock.decodeJid(m.msg.contextInfo.remoteJid || m.chat || m.sender)
    m.quoted.isBaileys = m.quoted.id && m.quoted.id.length === 16 || false
    m.quoted.sender = sock.decodeJid(m.msg.contextInfo.participant)
    m.quoted.fromMe = m.quoted.sender === sock.user.jid
    m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.contentText || ''
    m.quoted.name = sock.getName(m.quoted.sender)
    m.quoted.mentionedJid = m.quoted.contextInfo?.mentionedJid?.length && m.quoted.contextInfo.mentionedJid || []
    let vM = m.quoted.fakeObj = M.fromObject({
    key: {
    fromMe: m.quoted.fromMe,
    remoteJid: m.quoted.chat,
    id: m.quoted.id
    },
    message: quoted,
    ...(m.isGroup ? { participant: m.quoted.sender } : {})
    })
    m.getQuotedObj = m.getQuotedMessage = async () => {
    if (!m.quoted.id) return null
    let q = M.fromObject(await sock.loadMessage(m.quoted.id) || vM)
    return exports.smsg(sock, q)
    }
    if (m.quoted.url || m.quoted.directPath) m.quoted.download = (saveToFile = false) => sock.downloadM(m.quoted, m.quoted.mtype.replace(/message/i, ''), saveToFile)
    m.quoted.copyNForward = (jid, forceForward = true, options = {}) => sock.copyNForward(jid, vM, forceForward, options)
    m.quoted.delete = () => sock.sendMessage(m.quoted.chat, { delete: vM.key })
    }
    }
    if (m.msg && m.msg.url) m.download = (saveToFile = false) => sock.downloadM(m.msg, m.mtype.replace(/message/i, ''), saveToFile)
    m.name = m.pushName || sock.getName(m.sender)
    m.copyNForward = (jid = m.chat, forceForward = true, options = {}) => sock.copyNForward(jid, m, forceForward, options)
    m.delete = (pesan) => sock.sendMessage(m.chat, { delete: pesan.key })    
    try {
    if (m.msg && m.mtype == 'protocolMessage') sock.ev.emit('message.delete', m.msg.key)
    } catch (e) {
    console.error(e)
    }
    return m
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})