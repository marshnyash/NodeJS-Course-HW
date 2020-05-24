const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os'); 
const crypto = require('crypto');

let statistics = require('./statistics.json');
let formData = require('./formData.json');

const webserver = express();
const bodyParser = require('body-parser')

webserver.use(express.urlencoded({ extended: true }));
webserver.use(bodyParser.urlencoded({ extended: false }));
webserver.use(bodyParser.text());
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

webserver.use(
  '/main',
  express.static(path.resolve(__dirname,"Voting-front.html"))
);

webserver.use( (req, res, next) => {
  // эту мидлварь добавляем ТОЛЬКО для логгирования, т.к. сам express.static не ведёт логи
  logLineSync(logFN,`[${port}] static server called, originalUrl ${req.originalUrl}`);
  next();
});

webserver.get('/variants', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
  res.setHeader("Content-Type", "application/json");
  res.send(formData);
});

webserver.get('/stat', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);

  const contentType = req.headers['content-type'];
  res.setHeader("Access-Control-Allow-Origin","*"); 

  const ETag = crypto.createHash('sha256').update(``).digest('base64');
  let ifNoneMatch = req.header("If-None-Match");
  res.setHeader("Cache-Control","public, max-age=0"); 

  if (ifNoneMatch && (ifNoneMatch === ETag)) {
    res.status(304).end();
  } else {
    if (contentType === "application/json") {
      res.setHeader("Content-Type", "application/json");
      res.send(statistics);
    }
    else if (contentType === "application/xml") {
      res.setHeader("Content-Type", "application/xml");
      res.send(configurateXMLData());
    }
    else if (contentType === "text/html; charset=utf-8"){
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(configurateHTMLData());
    }
    
  } 
});

function configurateHTMLData(){
  let htmlStr = ``;
  statistics.forEach(e => htmlStr += `<p data-id="${e.id}"><span> ${e.count}</span></p>`);
  return htmlStr;
}

function configurateXMLData(){
  let xmlStr = ``;
  statistics.forEach(e => xmlStr += `<id>${e.id}</id><count> ${e.count}</count>`);
  return xmlStr;
}

webserver.post('/vote', (req, res) => { 
  logLineSync(logFN,`[${port}] service1 called`);
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
