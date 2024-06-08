// app.js

require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { connectToDatabase } = require('./objects/db');
const User = require('./objects/user');


const app = express();
const port = process.env.APP_PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//let db;
const url = process.env.MONGO_URL;

connectToDatabase().then((database) => {
    app.locals.db = database; // DB 객체를 Express의 로컬 변수에 저장
    app.listen(port, () => {
        console.log(`App server running on port ${port}`);
    });
}).catch((err) => {
    console.error('DB 연결 실패:', err);
});


/*
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공');
    db = client.db('forum');

    app.listen(port, () => {
        console.log(`App server running on port ${port}`);
    });
}).catch((err) => {
    console.log(err);
});
*/

/*------로그인------*/
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(session({
    secret: 'wdzaxse2:.-,/3',
    resave: false, //유저가 서버로 요청할 때마다 세션 갱신할건지
    saveUninitialized: false, // 로그인을 안해도 세션을 만들건지
    cookie: {
        maxAge: 1000 * 60 * 10, // 쿠키 유효 기간 10분
        httpOnly: true, // 자바스크립트의 Document.cookie API를 통해서만 쿠키에 접근할 수 있도록 제한
        secure: false // 쿠키를 HTTPS 연결을 통해서만 전송할 수 있도록 제한
    }
}));




// ------------사용자 모델------------


app.get('/login', (req, res) => {
    res.render('login.pug');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));



passport.use(new LocalStrategy(
async (username, password, done) => {
    const db = app.locals.db; // db 객체를 app.locals에서 가져옴
    try {
    const user = await User.findOne(db, { username: username });
    if (!user) {
        return done(null, false, { message: '사용자를 찾을 수 없습니다.' });
    }
    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
    }
    return done(null, user);
    } catch (err) {
    console.error(err);
    return done(err);
    }
}
));





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