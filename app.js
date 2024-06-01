// app.js

require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.APP_PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url = process.env.MONGO_URL;

new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공');
    db = client.db('forum');

    app.listen(port, () => {
        console.log(`App server running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await db.collection('post').find().toArray();
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

app.post('/posts', async (req, res) => {
    const { title, content } = req.body;
    if (!title || title.trim() === '') {
        res.status(400).send('제목을 입력해주세요.');
        return;
    }
    try {
        await db.collection('post').insertOne({ title, content });
        res.status(201).send('Post created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

app.delete('/posts/:id', async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send('유효하지 않은 ID 형식입니다.');
        return;
    }
    try {
        const result = await db.collection('post').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.send('Post deleted successfully');
        } else {
            res.status(404).send('게시글을 찾을 수 없습니다.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
});

app.put('/posts/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
    if (!ObjectId.isValid(id)) {
        res.status(400).send('유효하지 않은 ID 형식입니다.');
        return;
    }
    try {
        await db.collection('post').updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, content } }
        );
        res.send('Post updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating post');
    }
});

app.get('/posts/:id', async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send('유효하지 않은 ID 형식입니다.');
        return;
    }
    try {
        const post = await db.collection('post').findOne({ _id: new ObjectId(id) });
        if (post) {
            res.json(post);
        } else {
            res.status(404).send('게시글을 찾을 수 없습니다.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving post');
    }
});


app.get('/api/posts', async (req, res) => {
    console.log(req.query)
    const page = parseInt(req.query.page || '0');
    const limit = parseInt(req.query.limit || '10');

    console.log(`Received request for page: ${page}, with limit: ${limit}`); // 요청받은 페이지와 제한 수 로깅

    const posts = await db.collection('post').find().skip(page * limit).limit(limit).toArray();

    console.log(`Returning ${posts.length} posts`); // 반환되는 게시물 수 로깅

    res.json(posts);
});