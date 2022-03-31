// import fs from 'mz/fs';
// import path from 'path';

const express = require("express");
const path = require("path");
const fs = require("mz/fs");

const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const web3 = require('@solana/web3.js');

var axios = require('axios');
var MongoClient = require('mongodb').MongoClient;


// const parseXlsxToJson = require("utils/xlsxUtils.js");


// const { json } = require("stream/consumers");

const PORT = process.env.PORT || 3001;

const app = express();

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


const KEYPAIR_PATH = path.resolve(__dirname, '../wallet_solana/devnet');
const PROGRAM_KEYPAIR_PATH = path.resolve(__dirname, '../anchorapp/target/deploy');


/**
 * Test endpoint for Welcome
 */
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








var XLSX = require('xlsx')

async function parseXlsxIncentiveToJson(fileName) {

    if (!fileName) 
        throw new Error("FileName cannot be null");

    var workbook = XLSX.readFile('./uploads/'+fileName);
    var sheet_name_list = workbook.SheetNames;
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    
    // console.log(xlData);

    var d1 = JSON.stringify(xlData);
    // console.log("after stringify");
    // console.log(d1);

    return d1;
}


/**
 * API endpoint to enable upload of user files
 */
 app.post('/upload-incentive', async (req, res) => {

  // console.log(req);
  // console.log("1");

  try {
      if(!req.files) {
          
        // console.log("2");
          res.json("No File found");
      }
      else {

        // console.log("3");
          let incentiveFile = req.files.incentive;
          
          //Use the mv() method to place the file in upload directory (i.e. "uploads")
          var k = await incentiveFile.mv('./uploads/' + incentiveFile.name);
          // console.log("4");
          
          // console.log("about to parse");
          //Parse the uploaded file
          var parsedInfo = await parseXlsxIncentiveToJson(incentiveFile.name);
          // console.log("return from function");
          // console.log(parsedInfo);
          // console.log("5");

          var parsedIncentive = JSON.parse(parsedInfo);
          var fIncen={};
          
          // if (parsedIncentive) {

            
            fIncen.event_reward_map = Array();

            try {
                console.log(parsedIncentive);
                var i=0;
                parsedIncentive.forEach(rowValue => {
            

                    if (i>=11) {
                        fIncen.event_reward_map[i-11] = {event:'', reward:''};
                    }

                    for (const [key, val] of Object.entries(rowValue)) {
                        // console.log(`${key}: ${val}`);
                        
                        if (i==2 && key=="b")
                            fIncen.title = val;

                        if (i==3 && key=="b")
                            fIncen.ea_ratio = val;

                        if (i==4 && key=="b")
                            fIncen.valid_from = val;

                        if (i==5 && key=="b")
                            fIncen.valid_to = val;

                        if (i==6 && key=="b")
                            fIncen.budget_usd = val;
                        
                        if (i==7 && key=="b")
                            fIncen.reward_lock_days = val;

                        if (i==8 && key=="b")
                            fIncen.reward_disbursal_freq = val;

                        if (i>=11 && key=="a") 
                            fIncen.event_reward_map[i-11].event = val;

                        if (i>=11 && key=="b") 
                            fIncen.event_reward_map[i-11].reward = val;
                      
                    }

                    i++;
                });

                
                // console.log("final incentive");
                // console.log(fIncen);
                

            }catch (err) {
                console.log(err);
            }
          // }
          
          res.send(JSON.stringify(fIncen));
          
      }
  } catch (err) {
      res.status(500).send(err);
  }
});




async function getTransactionsOfAccount(address) {
  
  console.log("target:"+ { address});

  let connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
  const publicKey = new web3.PublicKey(address);

  var page = 1;
  var totalTx = 1000;
  let options = {limit:totalTx};

  while (totalTx == 1000) {

    
    try {
      
      var transSignatures = await connection.getConfirmedSignaturesForAddress2(publicKey, options);
      
      
      totalTx = transSignatures.length;
      console.log("page:"+ page+ " size:"+totalTx);
      // console.log("lateTx:", transSignatures[0].signature);

      var earlyTx = transSignatures[totalTx-1].signature;
      console.log("earlyTx:", earlyTx, transSignatures[totalTx-1].slot, transSignatures[totalTx-1].blockTime);
      // console.log("earlyTx time:", transSignatures[totalTx-1].blockTime);

      if (totalTx == 1000) {
        options = { before:earlyTx, limit:1000 };
      }

      page++;

      //Inserting transactions in Mongo
      //db.inventory.find( { tags: "red" } )

      MongoClient.connect("mongodb://localhost:27017/MyDb", function (err, db) {
    
        db.collection('Transactions', function (err, collection) {
            
          //protocol, signature, block, time, accounts[]
          for (let i = 0; i < transSignatures.length; i++) {
            collection.insert({});
          }
          collection.insert({ id: 1, firstName: 'Steve', lastName: 'Jobs' });
          collection.insert({ id: 2, firstName: 'Bill', lastName: 'Gates' });
          collection.insert({ id: 3, firstName: 'James', lastName: 'Bond' });

          db.collection('Persons').count(function (err, count) {
            if (err) throw err;
            console.log('Total Rows: ' + count);
          });
        });
                      
      });

      // console.log({ transSignatures });
      // const transactions = [];

      // for (let i = 0; i < transSignatures.length; i++) {

      //   const signature = transSignatures[i].signature;
      //   const confirmedTransaction = await connection.getConfirmedTransaction(signature,);

        // if (confirmedTransaction) {
        //   const { meta } = confirmedTransaction;
        //   console.log(JSON.stringify(meta));
        //   if (meta) {
        //     const oldBalance = meta.preBalances;
        //     const newBalance = meta.postBalances;
        //     const amount = oldBalance[0] - newBalance[0];
        //     const transWithSignature = {
        //       signature,
        //       ...confirmedTransaction,
        //       fees: meta?.fee,
        //       amount,
        //     };
        //     transactions.push(transWithSignature);
        //   }
        // }
      // }
      
      // console.log({ transactions });

      // return transactions;

    } catch (err) {

      throw err;
    }

  }

  return [];//dummy return to be removed later

}


/**
 * Fetch all transactions for a wallet 
 */
 app.get("/show-transactions", async (req, res) => {

  console.log("inside show-transactions");

  var account = "AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB"; //GST Token of StepN protocol

  transactions = await getTransactionsOfAccount(account);  

  res.json([{ message: "Showing transacions from server!" }]);
});


async function getSolanaFMData() {

  var data = JSON.stringify({
    query: `query {solana {blocksCreatedInTimeRange(time: { from: "2022-02-01T00:00:00Z", to: "2022-02-01T01:00:00Z", resolution: ONE_MIN }) {time value}}}`,
    variables: {}
  });

  var config = {
    method: 'post',
    url: 'https://api.solana.fm',
    headers: { 
      'apikey': "qVII/VRZUkxQ4m3m7ZuikTceo/kRwCUYKdyzE6ekLtM=", 
      'Content-Type': 'application/json'
    },
    data : data
  };

  console.log(data);
  // return "1";

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));

    return response.data;
  })
  .catch(function (error) {
    console.log("error");
    // console.log(error);
  });

}

app.get("/sfm/test", async (req, res) => {

  console.log("inside solana fm test");

  var data = await getSolanaFMData();
  
  res.json([{ message: "Showing results from solanaFM" }]);

});