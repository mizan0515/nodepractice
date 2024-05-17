const express = require ('express');
const app  =  express();

app.use(express.static(__dirname + '/public'))


app.set('view engine', 'pug');
app.set('views', './views'); // 'views' 디렉토리 안에 Pug 파일 위치


const {MongoClient} = require('mongodb');

let db
const url = 'mongodb+srv://mizan:whdgh29k05@forum.qvpgxre.mongodb.net/?retryWrites=true&w=majority&appName=forum';
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')

  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })

}).catch((err)=>{
  console.log(err)
})





app.get('/',function(요청,응답){
    응답.sendFile(__dirname + '/index.html');
}); 


app.get('/test',function(요청,응답){
    응답.send('반갑습니다')
}); 


app.get('/beauty',function(요청,응답){
    응답.send('뷰티관련 페이지입니다');
    db.collection
}); 

app.get('/write',function(요청,응답){
    db.collection('post').insertOne({title:'어쩌구'});
    응답.sendFile(__dirname + '/write.html');
}); 

app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray();
    응답.render('list', { posts: result });
})
