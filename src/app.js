require('dotenv').config();

const express = require('express');
const { connectDB } = require('./db');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

app.get('/health', (req, res) => {
	res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Connect to MongoDB
connectDB()
	.then(() => {
		console.log('Database connection established');
		// Routes
		app.use('/api/auth', require('./routes/auth'));
		app.use('/', require('./routes/link'));

		const port = process.env.PORT || 3000;
		app.listen(port, () => console.log(`Server running on port ${port}`));
	})
	.catch((err) => {
		console.error('Failed to connect to database', err);
		process.exit(1);
	});
