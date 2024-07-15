const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createLink, findLinkById, deleteLinkById } = require('../models/Link');
const auth = require('../middleware/auth');

// Generate Link
router.post('/generate', auth, async (req, res) => {
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
		const generatedLink = `http://localhost:3000/PAYLINKLJIHB-${linkId}`;
		// console.log(generatedLink);
		res.json({ link: generatedLink });
	} catch (err) {
		console.log(err);
		res.status(500).json({ msg: 'Server error' });
	}
});

// Access Link
router.get('/PAYLINKLJIHB-:linkId', async (req, res) => {
	try {
		const link = await findLinkById(req.params.linkId);
		if (!link)
			return res.status(404).json({ msg: 'Link not found or expired' });
		res.json({ name: link.name, upi_id: link.upi_id, amount: link.amount });
	} catch (err) {
		res.status(500).json({ msg: 'Server error' });
	}
});

module.exports = router;
