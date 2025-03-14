const express = require('express');
const router = express.Router();
const { createUser, findUserByEmail } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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

module.exports = router;
