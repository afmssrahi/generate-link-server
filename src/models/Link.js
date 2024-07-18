const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

const collectionName = 'links';

const createLink = async (userId, name, upi_id, amount, linkId) => {
	const db = getDB();
	const expirationTime = new Date(Date.now() + 30 * 60 * 1000); // Set expiration time to 3 minutes from now
	const result = await db.collection(collectionName).insertOne({
		userId: new ObjectId(userId),
		name,
		upi_id,
		amount,
		linkId,
		createdAt: new Date(),
		expirationTime,
	});
	return result;
};

const findLinkById = async (linkId) => {
	const db = getDB();
	const link = await db.collection(collectionName).findOne({ linkId });

	if (!link) return null;

	const currentTime = new Date();
	if (currentTime > link.expirationTime) {
		// await deleteLinkById(linkId); // Optionally delete expired links
		return null;
	}

	return link;
};

const deleteLinkById = async (linkId) => {
	const db = getDB();
	return await db.collection(collectionName).deleteOne({ linkId });
};

module.exports = { createLink, findLinkById, deleteLinkById };
