// interface.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const interface = express();
const port = process.env.INTERFACE_PORT || 8080;

interface.use(express.json());
interface.use(express.urlencoded({ extended: true }));
interface.use(express.static(path.join(__dirname, 'public')));

interface.set('view engine', 'pug');
interface.set('views', './views');

const APP_SERVER_URL = `http://localhost:${process.env.APP_PORT}`;

interface.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts`);
        res.render('list', { posts: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

interface.get('/write', (req, res) => {
    res.render('write.pug', { method: 'post' });
});

interface.get('/list', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts`);
        res.render('list', { posts: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

interface.post('/submit-post', async (req, res) => {
    try {
        await axios.post(`${APP_SERVER_URL}/posts`, req.body);
        res.redirect('/list');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

interface.get('/edit/:id', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts/${req.params.id}`);
        res.render('write.pug', { url: `/posts/${req.params.id}`, post: response.data, method: 'put', baseUrl: process.env.BASE_URL });
    } catch (err) {
        console.error(err);
        res.status(404).send('잘못된 url입니다.');
    }
});

interface.post('/submit-shorts', async (req, res) => {
    console.log(req.body);
    // Further implementation needed based on actual requirement
});

interface.get('/detail/:id', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/posts/${req.params.id}`);
        res.render('detail.pug', { result: response.data });
    } catch (err) {
        console.error(err);
        res.status(404).send('잘못된 url입니다.');
    }
});

interface.get('/api/posts', async (req, res) => {
    try {
        const response = await axios.get(`${APP_SERVER_URL}/api/posts?page=${req.query.page}&limit=${req.query.limit}`);
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving posts');
    }
});

interface.listen(port, () => {
    console.log(`Interface server running on port ${port}`);
});

