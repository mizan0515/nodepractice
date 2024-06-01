// startS.js

const { exec } = require('child_process');


// 앱 서버 실행
const appServer = exec('nodemon app.js');
appServer.stdout.on('data', (data) => {
    console.log(`App Server: ${data}`);
});
appServer.stderr.on('data', (data) => {
    console.error(`App Server Error: ${data}`);
});


// 인터페이스 서버 실행
const interfaceServer = exec('nodemon interface.js');
interfaceServer.stdout.on('data', (data) => {
    console.log(`Interface Server: ${data}`);
});
interfaceServer.stderr.on('data', (data) => {
    console.error(`Interface Server Error: ${data}`);
});