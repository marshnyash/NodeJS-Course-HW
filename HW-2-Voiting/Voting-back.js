const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

let statistics = require('./statistics.json');
let formData = require('./formData.json');

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
  res.setHeader("Access-Control-Allow-Origin","*"); 
  res.setHeader("Content-Type", "application/json");
  const reqData = req.body;
  if(Object.keys(reqData).length){
    const selectedElem = statistics.find(e => e.id === reqData.selection);
    ++selectedElem.count;
    const jsonString = JSON.stringify(statistics)
    fs.writeFile('statistics.json', jsonString, err => {
      err ? console.log('Error writing file', err) : console.log('Successfully wrote file')
    });
    res.send("Ваш голос принят успешно");
  } else {
    res.send("Вы не проголосовали");
  };
});

webserver.listen(port,()=>{
  logLineSync(logFN,`web server running on port ${port}`);
});
