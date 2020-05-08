const express = require('express');

const webserver = express(); // создаём веб-сервер

const port = 7580;

webserver.get('/form', (req, res) => { 
    console.log(`req.query = ${req.query}`);
    let login = req.query.login ? req.query.login : '';
    let password = req.query.password ? req.query.password : '';
    let isCorrectLogin = login && login.length > 5;
    let isCorrectPassword = password && password.length > 9;
    if(isCorrectLogin && isCorrectPassword){
      res.send(`You logged wuth login ${login} in successfully`);
    } else {
      res.send(createForm(login, password, 'Data is not valid'));
    }
});

// просим веб-сервер слушать входящие HTTP-запросы на этом порту
webserver.listen(port, () => { 
  console.log("web server running on port " + port);
}); 

function createForm(login, password, error){
  return `
    <form action="/form" method="get">
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