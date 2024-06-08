// interface.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const interface = express();
const port = process.env.INTERFACE_PORT || 8080;

interface.use(express.json());
interface.use(express.urlencoded({ extended: true }));
interface.use(express.static(path.join(__dirname, 'public')));

interface.set('view engine', 'pug');
interface.set('views', './views');

const APP_SERVER_URL = `http://localhost:${process.env.APP_PORT}`;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node Practice API',
            version: '1.0.0',
            description: 'A simple Express API'
        },
        servers: [
            {
                url: 'http://localhost:8080'
            }
        ],
    },
    apis: ['./interface.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

interface.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Retrieve login page data
 *     responses:
 *       200:
 *         description: A successful response
 *       500:
 *         description: Server error
 */
interface.get('/login', (req, res) => {
    axios.get(`${APP_SERVER_URL}/login`)
        .then(response => {
            res.render('login.pug', { loginData: response.data });
        })
        .catch(error => {
            console.error('로그인 페이지 로드 실패:', error);
            res.status(500).send('서버 에러');
        });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: 메인. 게시물 리스트 출력
 *     responses:
 *       200:
 *         description: 게시물 리스트 출력
 *       500:
 *         description: 게시물 리스트 출력 실패
 */
interface.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts`);
        res.render('list', { posts: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

/**
 * @swagger
 * /write:
 *   get:
 *     summary: 게시물 작성 페이지 출력
 *     responses:
 *       200:
 *         description: 게시물 작성 페이지 출력
 */
interface.get('/write', (req, res) => {
    res.render('write.pug', { method: 'post' });
});

/**
 * @swagger
 * /list:
 *   get:
 *     summary: 게시물 리스트 출력
 *     responses:
 *       200:
 *         description: 게시물 리스트 출력
 *       500:
 *         description: 게시물 리스트 출력 실패
 */
interface.get('/list', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts`);
        res.render('list', { posts: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

/**
 * @swagger
 * /submit-post:
 *   post:
 *     summary: 게시물 작성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       303:
 *         description: 게시물 작성 후 리스트 페이지로 이동
 *       500:
 *         description: 게시물 작성 실패
 */
interface.post('/submit-post', async (req, res) => {
    try {
        await axios.post(`${APP_SERVER_URL}/posts`, req.body);
        res.redirect('/list');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

/**
 * @swagger
 * /edit/{id}:
 *   get:
 *     summary: 게시물 수정 페이지 출력
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 게시물 수정 페이지 출력
 *     responses:
 *       200:
 *         description: 게시물 수정 페이지 출력
 *       404:
 *         description: 잘못된 URL
 */
interface.get('/edit/:id', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts/${req.params.id}`);
        res.render('write.pug', { 
            url: `/posts/${req.params.id}`, 
            post: response.data, 
            method: 'put', 
            baseUrl: process.env.INTERFACE_SERVER_URL 
        });
    } catch (err) {
        console.error(err);
        res.status(404).send('잘못된 url입니다.');
    }
});





/**
 * @swagger
 * /submit-shorts:
 *   post:
 *     summary: Submit shorts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: A successful response
 */
interface.post('/submit-shorts', async (req, res) => {
    console.log(req.body);
    // Further implementation needed based on actual requirement
});

/**
 * @swagger
 * /detail/{id}:
 *   get:
 *     summary: Retrieve the details of a post
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A detailed view of a post
 *       404:
 *         description: Invalid URL
 */
interface.get('/detail/:id', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts/${req.params.id}`);
        res.render('detail.pug', { result: response.data });
    } catch (err) {
        console.error(err);
        res.status(404).send('잘못된 url입니다.');
    }
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve posts with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: true
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of posts
 *       400:
 *         description: Invalid page or limit values
 *       500:
 *         description: Error retrieving posts
 */
interface.get('/api/posts', async (req, res) => {
    const page = parseInt(req.query.page || '0', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    if (isNaN(page) || isNaN(limit) || page < 0 || limit <= 0) {
        return res.status(400).send('유효하지 않은 페이지 또는 제한 값입니다.');
    }

    try {
        if (!APP_SERVER_URL) {
            throw new Error('APP_SERVER_URL이 정의되지 않았습니다.');
        }
        console.log(`${APP_SERVER_URL}/api/posts?page=${page}&limit=${limit}`);
        const response = await axios.get(`${APP_SERVER_URL}/api/posts?page=${page}&limit=${limit}`);
        console.log(response.data);
        res.json({ totalPosts: response.data.totalPosts, posts: response.data.posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('게시물을 검색하는 중 오류가 발생했습니다.');
    }
});



interface.put('/api/edit/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;

    try {
        const response = await axios.put(`${APP_SERVER_URL}/edit/${id}`, { title, content });
        if (response.status === 200) {
            res.send('게시물이 성공적으로 업데이트되었습니다.');
            //res.redirect('/list');
        } else {
            res.status(response.status).send('게시물 업데이트에 실패했습니다.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('게시물 업데이트 중 서버 오류가 발생했습니다.');
    }
});






interface.listen(port, () => {
    console.log(`Interface server running on port ${port}`);
});

