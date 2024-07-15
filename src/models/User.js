const { getDB } = require('../db');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const collectionName = 'users';

const createUser = async (email, password) => {
	const db = getDB();
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	const result = await db
		.collection(collectionName)
		.insertOne({ email, password: hashedPassword });
	return result.ops[0];
};

const findUserByEmail = async (email) => {
	const db = getDB();
	return await db.collection(collectionName).findOne({ email });
};

const findUserById = async (id) => {
	const db = getDB();
	return await db
		.collection(collectionName)
		.findOne({ _id: new ObjectId(id) });
};

module.exports = { createUser, findUserByEmail, findUserById };
