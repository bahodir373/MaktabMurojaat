const mongoose = require('mongoose');
require('dotenv').config()

const dbConnect = async () => {
	try{
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})

		console.log('Connected to MongoDB')
	}catch(error){
		console.log(error)
	}
}

module.exports = dbConnect