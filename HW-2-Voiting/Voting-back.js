const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os'); 

let statistics = require('./statistics.json');
let formData = require('./formData.json');

const webserver = express();
const bodyParser = require('body-parser')

webserver.use(express.urlencoded({ extended: true }));
webserver.use(bodyParser.urlencoded({ extended: false }));
webserver.use(bodyParser.json());


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
  res.setHeader("Content-Type", "application/json");
  res.send(formData);
});

webserver.post('/stat', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.setHeader("Content-Type", "application/json");
  res.send(statistics);
});


webserver.post('/vote', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.setHeader("Content-Type", "application/json");
  const reqData = req.body;
  const selectedElem = reqData.find(e => e.checked);
  if(selectedElem){
    const statElem = statistics.find(e => e.id === selectedElem.id);
    ++statElem.count;
    const statisticsStr = JSON.stringify(statistics);
    fs.writeFile('statistics.json', statisticsStr, err => {
      err ? console.log('Error writing file', err) : console.log('Successfully wrote file')
    });
    res.send('ok');
  } else {
    res.send(`Новых голосов нет`);
  }
});

webserver.listen(port,()=>{
  logLineSync(logFN,`web server running on port ${port}`);
});
