require('dotenv').config();
const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URL;

let db;

async function connectToDatabase() {
    if (db) {
        return db; // 이미 연결되어 있는 경우
    }

    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('forum');
    console.log('DB 연결 성공');
    return db;
}

module.exports = { connectToDatabase };
