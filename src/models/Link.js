const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	name: {
		type: String,
		required: true,
	},
	upi_id: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	linkId: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	expirationTime: {
		type: Date,
		required: true,
	},
});

const Link = mongoose.model('Link', linkSchema);

const createLink = async (userId, name, upi_id, amount, linkId) => {
	const expirationTime = new Date(Date.now() + 30 * 60 * 1000); // Set expiration time to 3 minutes from now
	const link = new Link({
		userId,
		name,
		upi_id,
		amount,
		linkId,
		expirationTime,
	});
	await link.save();
	return link;
};

const findLinkById = async (linkId) => {
	const link = await Link.findOne({ linkId });

	if (!link) return null;

	const currentTime = new Date();
	if (currentTime > link.expirationTime) {
		// Optionally delete expired links
		// await link.remove();
		return null;
	}

	return link;
};

const deleteLinkById = async (linkId) => {
	return await Link.deleteOne({ linkId });
};

module.exports = { createLink, findLinkById, deleteLinkById };
