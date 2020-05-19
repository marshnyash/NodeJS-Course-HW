const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

let jsonData = require('./data.json');

const webserver = express();

webserver.use(express.urlencoded({extended:true}));

const port = 7580;
const logFN = path.join(__dirname, '_server.log');


function logLineSync(logFilePath,logLine) {
  const logDT = new Date();
  let time = logDT.toLocaleDateString() + " " + logDT.toLocaleTimeString();
  let fullLogLine = `${time} ${logLine}`;
  const logFd = fs.openSync(logFilePath, 'a+');
  fs.writeSync(logFd, fullLogLine + os.EOL);
  fs.closeSync(logFd);
}

webserver.get('/main', (req, res) => { 
  res.sendFile(__dirname + '/Voting-front.html');
});

webserver.get('/variants', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.setHeader("Content-Type", "text/html");
  res.send(createVotingTmp());
});

webserver.post('/stat', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.setHeader("Content-Type", "application/json");
  res.send(jsonData);
});


webserver.post('/vote', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.setHeader("Access-Control-Allow-Origin","*"); 
  res.setHeader("Content-Type", "application/json");
  const reqData = req.body;
  if(Object.keys(reqData).length){
    const selectedElem = jsonData.find(e => e.id === reqData.selection);
    ++selectedElem.count;
    const jsonString = JSON.stringify(jsonData)
    fs.writeFile('data.json', jsonString, err => {
      err ? console.log('Error writing file', err) : console.log('Successfully wrote file')
    });
    res.send("Ваш голос принят успешно");
  } else {
    res.send("Вы не проголосовали");
  };
});

function createVotingTmp() { 
  return `
    <form method=POST action="http://178.172.195.18:7580/vote"> 
      <p><b>Какое у вас состояние разума?</b></p>
      <p><input name="selection" type="radio" value="nedzen"> Не дзен</p>
      <p><input name="selection" type="radio" value="dzen"> Дзен</p>
      <p><input name="selection" type="radio" value="pdzen" > Полный дзен</p>
      <p><input type="submit" value="Выбрать"></p>
    </form>
  ` 
}

webserver.listen(port,()=>{
  logLineSync(logFN,`web server running on port ${port}`);
});
