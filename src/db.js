const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

let db;

const connectDB = async () => {
	if (!db) {
		try {
			await client.connect();
			db = client.db('mydatabase');
			console.log('MongoDB connected');
		} catch (err) {
			console.error(err);
		}
	}
	return db;
};

const getDB = () => {
	if (!db) throw new Error('Database not connected!');
	return db;
};

module.exports = { connectDB, getDB };
