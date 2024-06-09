/*----------------로그인-----------------*/

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const bcrypt = require('bcrypt');
const User = require('./objects/user');
const bodyParser = require('body-parser');
const express = require('express');

const router = express.Router();


router.use(passport.initialize());
router.use(session({
    secret: process.env.MONGO_SECRET,
    resave: false, //유저가 서버로 요청할 때마다 세션 갱신할건지
    saveUninitialized: false, // 로그인을 안해도 세션을 만들건지
    cookie: {
        maxAge: 1000 * 60 * 10, // 쿠키 유효 기간 10분
        httpOnly: true, // 자바스크립트의 Document.cookie API를 통해서만 쿠키에 접근할 수 있도록 제한
        secure: true // 쿠키를 HTTPS 연결을 통해서만 전송할 수 있도록 제한
    }
}));




// ------------사용자 모델------------


router.get('/login', (req, res) => {
    res.render('login.pug');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));



  passport.use(new LocalStrategy(
    async (username, password, done) => {
        const db = req.app.locals.db;
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



module.exports = router;