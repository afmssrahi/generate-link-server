require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

app.get('/health', (req, res) => {
	console.log('Health check');
	res.status(200).json({ status: 'UP', message: 'Server is running' });
});

const { createUser, findUserByEmail } = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

// Register a new user
app.post('/register', async (req, res) => {
	console.log('====================== Register ======================');
	const { email, password } = req.body;
	try {
		const existingUser = await findUserByEmail(email);
		if (existingUser)
			return res.status(400).json({ msg: 'User already exists' });

		const user = await createUser(email, password);

		console.log(user, 'user created');
		res.json(user);
	} catch (err) {
		res.status(500).json({ msg: 'Server error from register route' });
	}
});

// Login user
app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	console.log(req.body);
	try {
		const user = await findUserByEmail(email);
		if (!user) return res.json({ msg: 'Invalid credentials' });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.json({ msg: 'Invalid credentials' });

		const payload = {
			user: {
				id: user._id,
			},
		};

		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '1h' },
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		res.status(500).json({ msg: 'Server error' });
	}
});

const { v4: uuidv4 } = require('uuid');
const { createLink, findLinkById, deleteLinkById } = require('./models/Link');

app.get('/health2', (req, res) => {
	console.log('Health check 2');
	res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Generate Link
app.post('/generate', auth, async (req, res) => {
	const { name, upi_id, amount } = req.body;

	try {
		const linkId = uuidv4();
		const link = await createLink(
			req.user.id,
			name,
			upi_id,
			amount,
			linkId
		);
		// const generatedLink = `https://applicationpayment.in/PAYLINKLJIHB-${linkId}`;
		// const generatedLink = `http://localhost:3000/PAYLINKLJIHB-${linkId}`;
		// console.log(generatedLink);
		res.json({ linkID: linkId });
	} catch (err) {
		console.log(err);
		res.status(500).json({ msg: 'Server error' });
	}
});

// Access Link
app.get('/PAYLINKLJIHB-:linkId', async (req, res) => {
	try {
		const link = await findLinkById(req.params.linkId);
		console.log(link);
		if (!link)
			return res.status(404).json({ msg: 'Link not found or expired' });
		res.json({ name: link.name, upi_id: link.upi_id, amount: link.amount });
	} catch (err) {
		res.status(500).json({ msg: 'Server error' });
	}
});

// Connect to MongoDB
connectDB()
	.then(() => {
		console.log('Database connection established');
		// Routes
		app.use('/api/auth', require('./routes/auth'));
		app.use('/', require('./routes/link'));

		const port = 3000;
		app.listen(port, () => console.log(`Server running on port ${port}`));
	})
	.catch((err) => {
		console.error('Failed to connect to database', err);
		process.exit(1);
	});

app.use('*', (req, res) => {
	res.status(404).json({ msg: 'Requested resource could not be found 😐' });
});
