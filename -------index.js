require('dotenv').config();


const express = require ('express');

const app  =  express();

const path = require('path');

const {MongoClient} = require('mongodb');

const { ObjectId } = require('mongodb');

const bodyParser = require('body-parser');

const port = process.env.PORT || 8080;

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// URL 인코딩된 데이터를 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));


app.use(express.static(__dirname + '/public'))




app.set('view engine', 'pug');
app.set('views', './views'); // 'views' 디렉토리 안에 Pug 파일 위치


let db
const url = 'mongodb+srv://mizan:whdgh29k05@forum.qvpgxre.mongodb.net/?retryWrites=true&w=majority&appName=forum';
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')

  app.listen(8080, () => {
    console.log(`${process.env.BASE_URL} 에서 서버 실행중`);
  });

}).catch((err)=>{
  console.log(err)
})


app.get('/', async(req, res) => {
    let result = await db.collection('post').find().toArray();
    console.log(result)
    res.render('list', { posts: result });
  });


app.get('/write', function(요청, 응답) {
    응답.render('write.pug', { method: 'post' });
});


app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray();
    console.log(result)
    응답.render('list', { posts: result });
})


app.post('/submit-post', async (요청, 응답) => {
    console.log(요청.body)
    const { title, content } = 요청.body;
    if (!title || title.trim() === '') {
        응답.status(400).send('제목을 입력해주세요.');
        return;
    }
    try {
        await db.collection('post').insertOne({ title, content });
        응답.redirect('/list');
    } catch (err) {
        console.error(err);
        응답.status(500).send('게시글 추가 중 오류가 발생했습니다.');
    }
});



app.post('/submit-shorts', async (요청, 응답) => {
    console.log(요청.body)

})

// DELETE 엔드포인트: ID로 포스트 삭제

app.delete('/delete-post', async (요청, 응답) => {
    const { id } = 요청.body;
    console.log(id)
    // Validate the id
    if (!ObjectId.isValid(id)) {
        return 응답.status(400).send({ success: false, message: '유효하지 않은 ID 형식입니다.', toast: '유효하지 않은 ID 형식입니다.' });
    }

    try {
        const objectId = new ObjectId(id);
        const result = await db.collection('post').deleteOne({ _id: objectId });

        if (result.deletedCount === 1) {
            응답.send({ success: true, message: '게시글이 삭제되었습니다.', toast: '게시글 삭제 성공!' });
        } else {
            응답.send({ success: false, message: '게시글을 찾을 수 없습니다.', toast: '게시글을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(err);
        응답.status(500).send({ success: false, message: '게시글 삭제 중 오류가 발생했습니다.', toast: '오류로 인해 게시글 삭제 실패!' });
    }
});

app.get ('/edit/:id', async(요청, 응답)=>{
    try {
        console.log("get started");
        const result = await db.collection('post').findOne({_id: new ObjectId(요청.params.id)});
        console.log("db collection ended" + result);
        응답.render('write.pug', {url: `/posts/${요청.params.id}`, post: result, method: 'put', baseUrl: process.env.BASE_URL });
        console.log("get ended");
    } catch (err) {
        console.log(err);
        응답.status(404).send('잘못된 url입니다.');
    }

})

app.put('/posts/:id', async(요청, 응답) => {
    console.log("putstart");
    const id = 요청.params.id;
    const { title, content } = 요청.body;

    if (!ObjectId.isValid(id)) {
        return 응답.status(400).send({
          success: false,
          message: '유효하지 않은 ID 형식입니다.',
          toast: '유효하지 않은 ID 형식입니다.'
        });
    }

    try {

        const objectId = new ObjectId(id);
        console.log(objectId)

        await db.collection('post').updateOne(
          { _id: objectId },
          { $set: { title: title, content: content } }
        );

        응답.status(200).send({ success: true, message: 'Post updated successfully' });
        
      } catch (err) {
        console.error(err);
        응답.status(500).send(err);
      }
  });


app.get('/detail/:id', async(요청, 응답)=>{
    try{
        let result = await db.collection('post').findOne({_id: new ObjectId(요청.params.id)})
        //console.log(요청.params)
        if(result){
            응답.render('detail.pug', {result : result})  
        }else{
            응답.status(404).send('잘못된 url입니다.')
        }
    }catch(err){
        console.log(err)
        응답.status(404).send('잘못된 url입니다.')
    }
})

