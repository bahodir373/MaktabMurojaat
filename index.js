const TelegramBot = require('node-telegram-bot-api')
const MurojaatModel = require('./models/MurojaatModel')
const dbConnect = require('./db/dbConnect')
require('dotenv').config()
const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })

dbConnect()

bot.setMyCommands([
	{ command: '/start', description: 'Start the bot' },
	{
		command: '/get_today',
		description:
			"Bugungi murojaatlarni va takliflarni ko'rish(faqat maktab ma'muriyati uchun!)",
	},
	{
		command: '/get_10_day',
		description:
			"Oxirgi 10 kunlik murojaatlarni va takliflarni ko'rish(faqat maktab ma'muriyati uchun!)",
	},
])

const adminsID = [35362445, 542782966, 389113605]

function runBot() {
	bot.on('message', async msg => {
		const chatID = msg.chat.id
		const text = msg.text

		if (text === '/start') {
			bot.sendMessage(
				chatID,
				`Salom, ${msg.from.first_name}! Bu yerga murojaat yoki taklifingizni yozishingiz mumkin.`
			)
		} else if (text == '/get_today') {
			if (adminsID.includes(chatID)) {
				const today = new Date()
				const start = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate()
				)
				const end = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate() + 1
				)

				const murojaat = await MurojaatModel.find({
					date: {
						$gte: start,
						$lt: end,
					},
				})

				if (murojaat.length > 0) {
					bot.sendMessage(
						chatID,
						`Bugungi murojaat va takliflar:\n${murojaat
							.map((item, index) => `${index + 1}. ${item.murojaat}`)
							.join('\n')}`
					)
				} else {
					bot.sendMessage(chatID, `Bugun murojaat va takliflar yo'q`)
				}
			} else {
				bot.sendMessage(chatID, `Xabarlarni o'qish uchun sizda ruxsat yo'q!`)
			}
		} else if (text == '/get_10_day') {
			if (adminsID.includes(chatID)) {
				const today = new Date()
				const start = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate() - 10
				)
				const end = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate() + 1
				)

				const murojaatlar = await MurojaatModel.find({
					date: {
						$gte: start,
						$lt: end,
					},
				})

				if (murojaatlar.length > 0) {
					const formatDate = date => {
						return `${date.getDate()}.${
							date.getMonth() + 1
						}.${date.getFullYear()}`
					}

					const message = murojaatlar
						.map(
							(item, index) =>
								`${index + 1}. ${item.murojaat} (${formatDate(
									new Date(item.date)
								)})`
						)
						.join('\n')

					bot.sendMessage(
						chatID,
						`Oxirgi o'n kunlik murojaat va takliflar:\n${message}`
					)
				} else {
					bot.sendMessage(
						chatID,
						`Oxirgi o'n kun ichida murojaat va takliflar yo'q.`
					)
				}
			} else {
				bot.sendMessage(chatID, `Xabarlarni o'qish uchun sizda ruxsat yo'q!`)
			}
		} else {
			await MurojaatModel.create({
				chatID: chatID,
				full_name: msg.from.first_name,
				username: msg.from.username,
				murojaat: text,
			})

			bot.sendMessage(
				chatID,
				`${msg.from.first_name} sizning murojaatingiz qabul qilindi.`
			)
		}
	})
}

runBot()
