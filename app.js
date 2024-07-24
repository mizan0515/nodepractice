// app.js

require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./objects/db');
const User = require('./objects/user');
const authRoutes = require('./auth'); // auth.js 모듈 임포트


const app = express();
const port = process.env.APP_PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes); // auth 라우터 사용



connectToDatabase().then((database) => {
    app.locals.db = database; // DB 객체를 Express의 로컬 변수에 저장
    app.listen(port, () => {
        console.log(`App server running on port ${port}`);
    });
}).catch((err) => {
    console.error('DB 연결 실패:', err);
});



module.exports = { connectToDatabase };




/*------게시물------*/


// 게시물 새로 작성
app.get('/posts', async (req, res) => {
    const db = req.app.locals.db; // db 객체를 req.app.locals에서 가져옴
    try {
        const posts = await db.collection('post').find().toArray();
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});



// 게시물 삭제
app.delete('/posts/:id', async (req, res) => {
    const db = req.app.locals.db; // db 객체를 req.app.locals에서 가져옴
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


// 게시물 수정
app.put('/edit/:id', async (req, res) => {
    const db = req.app.locals.db; // db 객체를 req.app.locals에서 가져옴
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


// 상세보기
app.get('/posts/:id', async (req, res) => {
    const db = req.app.locals.db; // db 객체를 req.app.locals에서 가져옴
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



// 목록 출력
app.get('/api/posts', async (req, res) => {
    const db = req.app.locals.db; // db 객체를 req.app.locals에서 가져옴
    console.log(req.query);
    const page = parseInt(req.query.page || '0', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    if (isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
        return res.status(400).send('유효하지 않은 페이지 또는 제한 값입니다.');
    }

    console.log(`Received request for page: ${page}, with limit: ${limit}`); // 요청받은 페이지와 제한 수 로깅

    try {
        const totalPosts = await db.collection('post').countDocuments(); // 총 게시물 수 계산
        const posts = await db.collection('post').find().skip(page * limit).limit(limit).toArray();

        console.log(`Returning ${posts.length} posts out of total ${totalPosts}`); // 반환되는 게시물 수와 총 게시물 수 로깅

        res.json({ totalPosts, posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('게시물을 검색하는 중 오류가 발생했습니다.');
    }
});