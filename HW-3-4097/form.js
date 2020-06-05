const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");

const webserver = express();

const port = 7580;

const { logLineAsync } = require('../utils/utils'); 
const logFN = path.join(__dirname, '_server.log');

let loginData;
let passwordData;

webserver.use(bodyParser.urlencoded({ extended: false }));

webserver.use( (req, res, next) => {
  logLineAsync(logFN,`[${port}] server called, originalUrl = ${req.originalUrl}`);
  next();
});

webserver.get('/main', (req, res) => {
    res.send(createForm('', '', ''));
});

webserver.post('/form',  (req, res) => { 
  const reqData = req.body;

  const login = reqData ? reqData.login : undefined;
  const password = reqData ? reqData.password : undefined;

  setLoginData(login, password);

  let isCorrectLogin = getLoginData().loginData && getLoginData().loginData.length > 5;
  let isCorrectPassword = getLoginData().passwordData && getLoginData().passwordData.length > 9;
  
  if(getLoginData().loginData == undefined && getLoginData().passwordData == undefined){
    res.send(createForm('', '', ''));
  } else if(isCorrectLogin && isCorrectPassword){
    res.redirect(303, '/form/error');
  } else {
    res.redirect(303, '/form/success');
  }
});

webserver.get('/form/success', async (req, res) => { 
  logLineAsync(logFN,`[${port}]`);
  res.send(createForm(getLoginData().loginData,getLoginData().passwordData, 'Data is not valid'));
});

webserver.get('/form/error', async (req, res) => { 
  logLineAsync(logFN,`[${port}]`);
  res.send(`You logged with login ${getLoginData().loginData} in successfully`);
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port,()=>{
  logLineAsync(logFN,`web server running on port ${port}`);
});

function setLoginData(login, password) {
  loginData = login;
  passwordData = password;
}

function getLoginData() {
  return {
    loginData,
    passwordData
  } 
}

function createForm(login, password, error){
  return `
    <form action="/form" method="POST">
      <div>
        <input type="text" name="login" id="login" value="${login}" style="width: 150px; margin: 7px; padding: 7px; border-radius: 7px;">
      </div>
      <div>
        <input type="password" name="password" id="password" value="${password}" style="width: 150px; margin: 7px; padding: 7px; border-radius: 7px;">
      </div>
      <div>
        <button style="width: 100px; margin: 7px; padding: 7px; background-color: blue; color: white; border-radius: 7px;">Log in</button>
      </div>
    </form>
    <span class="error" style="margin: 7px; color: red;">${error}</span>
  `
}