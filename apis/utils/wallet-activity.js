/**
 * This script is written to process local transactiondb and update wallet-activity records for each protocol
 */

const {MongoClient} = require('mongodb');
// const web3 = require('@solana/web3.js');
const { time } = require('console');
// const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
// const connection = new web3.Connection("https://api.google.mainnet-beta.solana.com", 'confirmed');
//api.google.mainnet-beta.solana.com

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

console.log("hello inside wallet activity");

try {
  // var protocol = "AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB"; //GST Token of StepN protocol
  // var protocol = "1349iiGjWC7ZTbu6otFmJwztms122jEEnShKgpVnNewy"; //Katana

  var protos = [
    "1349iiGjWC7ZTbu6otFmJwztms122jEEnShKgpVnNewy", //Katana - done
    // "FC81tbGt6JWRXidaWYFXxGnTk4VgobhJHATvTRVMqgWj", //Mean
    // "4MNPdKu9wFMvEeZBMt3Eipfs5ovVWTJb31pEXDJAAxX5", //Grape
    // "JPv1rCqrhagNNmJVM5J1he7msQ5ybtvE1nNuHpDHMNU", //Jet
    // "mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68", //Mango
  ];

  callingFunction(protos);
    
}
catch (err) {
  throw err;
}

async function callingFunction(protos) {
  for (let p=0;p<protos.length;p++) {
    
    var protocol = protos[p];
    console.log("going after ",protocol);

    await getActivityOnProtocol(protocol);
  }
}

async function getActivityOnProtocol(protocol) {
  
    console.log("target:"+ protocol);

    
    try {

        //prepare activity Table
        await processTxData(protocol);

        //trying to upsert profile details in Doc0
        // await upsertProtocolprofile(protocol);
    }
    catch (err) {
        console.log("failed to upsert profile row");
        console.log(err);
    }
  
    return;
    // while (totalTx == 100) {


      //creating options object based on last saved tx id
      var lastTx = await getLastSavedTransactionId(protocol); //holds last transaction id
      if (lastTx.length) 
        options = { limit:totalTx , before:lastTx };
      else  
        options = {limit:totalTx};

      // console.log(options);

      // return;
  
      
      try {
        
        var transSignatures = await connection.getConfirmedSignaturesForAddress2(publicKey, options);
        // console.log("all transactions:",{transSignatures});

        
        totalTx = transSignatures.length;
        console.log("page:"+ page+ " size:"+totalTx);

        if (totalTx) {

          var docArray = [];

          for (let i = 0; i < transSignatures.length; i++) {

            doc = await getTransactionDetails(transSignatures[i]);
            if (Object.keys(doc).length) //checking if doc is non-empty
              docArray.push(doc);

            //waste some time
            // await sleep(1000);//1 sec
            await new Promise(resolve => setTimeout(resolve, 25)); //25ms
          }

          
          if (docArray.length) {
            console.log("attempting to write records:"+docArray.length+" for "+protocol);
            await saveInMongo(protocol, docArray);
            // console.log("written records");
          }

        }
        
        // break;//Breaks while loop.. to be removed after debugging
          
      }
      catch (err) {
        
        console.log("error in script");
        console.log(err);

        // break;
        // throw err;
      }

      page++;

    // }
  
  }


  async function getTransactionDetails (transSig) {

    var doc = {};
    var signature = transSig.signature;

    var confirmedTransaction =  await connection.getConfirmedTransaction(signature,);

    if (confirmedTransaction) {

      var addresses = [];

      for (let j = 0; j < confirmedTransaction.transaction.instructions.length; j++) {

        var ix = confirmedTransaction.transaction.instructions[j];
        for (let k=0; k<ix.keys.length; k++) {
          addresses.push(ix.keys[k].pubkey.toBase58());
        }
      }

      var { meta } = confirmedTransaction;
      var amount;
      
      if (meta) {
        var oldBalance = meta.preBalances;
        var newBalance = meta.postBalances;
        amount = oldBalance[0] - newBalance[0];
      }

      
      doc._id = signature;
      doc.blockTime = transSig.blockTime;
      doc.slot = transSig.slot;
      doc.accounts = addresses;
      doc.amount = amount;
      // doc.fee = meta?.fee;
      doc.timestamp = Date.now();

      // console.log(doc);

    }

    return doc;
    
  }

  /**
   * Persists the records in DB
   * @param {string} protocol 
   * @param {Array} docArray 
   */
  async function saveInMongo(protocol, docArray) {

    // console.log("in save",docArray);

    try {
      await client.connect();
      
      var insertResult = await client.db("solanatxdb").collection(protocol).insertMany(docArray);
      // console.log(insertResult.insertedCount);
    }
    catch (err) {
      console.log("Mongo error while saving");
      console.log(err);
    }
    finally {
      await client.close();
    }

  }


  /**
   * Preparing wallet activity table
   * @param {string} protocol 
   */
  async function processTxData(protocol) {

    await client.connect();
    var db = client.db("solanatxdb").collection(protocol);    

    //Total wallets
    await db.aggregate( 
      [
        {
          '$project': {
            'a': '$accounts'
          }
        }, {
          '$unwind': '$a'
        }, {
          '$project': {
            'a': '$a', 
          }
        }, {
          '$group': {
            '_id': '$a', 
            'b': {
              '$addToSet': '$b'
            }, 
            'tx': {
              '$addToSet': '$_id'
            }
          }
        }, {
          '$project': {
            '_id': '$_id', 
            'first_use': {
              '$min': '$b'
            }, 
            'count': {
              '$size': '$tx'
            }
          }
        }
      ]
    );

    


  }


  /**
   * Creating Doc0 with protocol details in wallet-activity
   * @param {string} protocol 
   */
  async function upsertProtocolprofile(protocol) {
    
    var lastTx = "";

    try {

      await client.connect();
      var db = client.db("solanatxdb").collection(protocol);

      var first_use_ts;//1st tx of protocol
      var last_use_ts;//last tx of protocol
      var total_wallets;
      var total_transactions;
      var total_blocktime; //points to lifetime of the protocol on mainnet
      var stage_ts = []; //array that stores timestamp limit for each stage of adoption curve
      
        //await db.find().sort({'blockTime':+1, 'timestamp':-1}).limit(1).toArray().then((ans) => {
        await db.find().sort({'blockTime':1}).limit(1).toArray().then((ans) => {
            // console.log(ans);
            if (ans.length) {
                first_use_ts = ans[0].blockTime;
                console.log("1st use ts: ",first_use_ts);
            }
        });

        await db.find().sort({'blockTime':-1}).limit(1).toArray().then((ans) => {
            // console.log(ans);
            if (ans.length) {
                last_use_ts = ans[0].blockTime;
                console.log("last use ts: ",last_use_ts);
            }
        });

        total_blocktime = last_use_ts - first_use_ts;


        // await db.aggregate( 
        //   [
        //     {
        //       '$project': {
        //         'a': '$accounts', 
        //         'b': '$blockTime'
        //       }
        //     }, {
        //       '$unwind': '$a'
        //     }, {
        //       '$project': {
        //         'a': '$a', 
        //         'b': '$b'
        //       }
        //     }, {
        //       '$group': {
        //         '_id': '$a', 
        //         'b': {
        //           '$addToSet': '$b'
        //         }, 
        //         'tx': {
        //           '$addToSet': '$_id'
        //         }
        //       }
        //     }, {
        //       '$project': {
        //         '_id': '$_id', 
        //         'first_use': {
        //           '$min': '$b'
        //         }, 
        //         'count': {
        //           '$size': '$tx'
        //         }
        //       }
        //     }
        //   ]
        // );


        //Total wallets
        await db.aggregate( 
          [
            {
              '$project': {
                'a': '$accounts'
              }
            }, {
              '$unwind': '$a'
            }, {
              '$project': {
                'a': '$a', 
              }
            }, {
              '$group': {
                '_id': '$a', 
                'b': {
                  '$addToSet': '$b'
                }, 
                'tx': {
                  '$addToSet': '$_id'
                }
              }
            }, {
              '$project': {
                '_id': '$_id', 
                'first_use': {
                  '$min': '$b'
                }, 
                'count': {
                  '$size': '$tx'
                }
              }
            }
          ]
        );


    }
    catch (err) {
      console.log("Mongo error while fetching");
      console.log(err);
    }
    finally {
      await client.close();
    }

    return lastTx;
  }