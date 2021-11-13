// import fs from 'mz/fs';
// import path from 'path';

const express = require("express");
const path = require("path");
const fs = require("mz/fs");

// const { json } = require("stream/consumers");

const PORT = process.env.PORT || 3001;

const app = express();

const KEYPAIR_PATH = path.resolve(__dirname, '../../my_wallet/localnet');
// const PROGRAM_KEYPAIR_PATH = path.resolve(__dirname, '../program/target/deploy');
const PROGRAM_KEYPAIR_PATH = path.resolve(__dirname, '../anchorapp/target/deploy');

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

app.get("/api", (req, res) => {
  res.json([{ message: "Hello from server!" }]);
});

/**
 * API endpoint to read the secret-key from filesystem
 */
app.get("/key-string", (req, res) => {

  console.log("inside key-string");
  
  let filePath='';

  let fileName = req.query.f;
  if (!fileName) {
    throw new Error("Filename not supplied in /key-string");
  }

  let p = req.query.p;
  if (p=='wallet') 
    filePath = path.join(KEYPAIR_PATH, fileName);
  else 
    if (p=='program') 
      filePath = path.join(PROGRAM_KEYPAIR_PATH, fileName);
    else 
      throw new Error("path not supplied in /key-string");

  console.log("path:"+filePath);

  const secretKeyString =  fs.readFileSync(filePath, { encoding: 'utf8' });

  console.log(secretKeyString);
  res.json(secretKeyString);
  //res.json([{ message: "Hello from server!" }]);

});
