import { useCallback, useState } from "react";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import os from 'os';
import yaml from 'yaml';

import Async from 'react-async';

  
// import fs from 'fs';

/**
 * Connection to the network
 */
 let connection: Connection;

 /**
  * Keypair associated to the fees' payer
  */
 let payer: Keypair;
 
 /**
  * Keypair associated to the program
  */
  let programKeypair: Keypair;
 
 /**
  * Keypair associated to Greeted address
  */
 let rxKeypair: Keypair;


 /**
  * Keypair associated to Listing address
  */
  let listingKeypair: Keypair;

 /**
  * Keypair associated to Reward address
  */
   let rewardKeypair: Keypair;
 
 /**
  * Hello world's program id
  */
 let programId: PublicKey;
 
 /**
  * The public key of the account we are saying hello to
  */
 let greetedPubkey: PublicKey;
 
 const EARP_TREASURY_PUBLIC_KEY = new PublicKey('FMBYVso8AFstfQidypqc6KVA5fPo6Yx6wjQdze2LL3uH');
 const BUSINESS_PUBLIC_KEY = new PublicKey('ABUdsXe6hAAz8J8raXpsuicwkyFJyZ6CHvccb6MpXDDh');

 /**
  * Path to program files
  */
 const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');
 
 /**
  * Path to localnet keypair files
  */
  const KEYPAIR_PATH = path.resolve(__dirname, '../../../my_wallet/localnet');
 
 /**
  * Path to program shared object file which should be deployed on chain.
  * This file is created when running either:
  *   - `npm run build:program-c`
  *   - `npm run build:program-rust`
  */
 const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'helloworld.so');
 
 /**
  * Path to the keypair of the deployed program.
  * This file is created when running `solana program deploy dist/program/helloworld.so`
  */
 const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'helloworld-keypair.json');
 
 /**
  * Path to the keypair of the deployed program.
  * This file is created when running `solana program deploy dist/program/helloworld.so`
  */
  const RX_KEYPAIR_PATH = path.join(KEYPAIR_PATH, 'test1.json');

  const PROGRAM_NAME = 'ear.so';
  const PROGRAM_KEYPAIR = 'ear-keypair.json';


/**
 * The state of a greeting account managed by the hello world program
 */
class RewardAccount {
  counter = 0;  
  buyers_addr : Array<String> = [];
    constructor(fields: {counter: number, buyers_addr: String[]} | undefined = undefined) {
      if (fields) {
        this.counter = fields.counter;
        this.buyers_addr = fields.buyers_addr;
      }
    }
  }
  
  /**
   * Borsh schema definition for greeting accounts
   */
  const RewardSchema = new Map([
    [RewardAccount, {
      kind: 'struct', 
      fields: [ 
        ['counter', 'u32'], 
        ['buyers_addr',['&str; 100']] 
      ] 
    } ],
  ]);
  
  /**
   * The expected size of each greeting account.
   */
  const REWARD_ACCOUNT_SIZE = borsh.serialize(
    RewardSchema,
    new RewardAccount(),
  ).length;

  // const REWARD_ACCOUNT_SIZE = 500;


/**
 * invoking smart contract to do following
 * a) Transfer Sol from reciever account to 
 *    EAR treasury (fees | owned by EAR), Rewards (owned by EAR) and Business (owned by Biz)
 * b) Increment the purchase counter in tracker account (owned by EAR), Retrieve the latest count
 * c) Check the disbursal criteria and distribite rewards amount among early-adopters
 */
export async function invokeSmartContract(destAddress : String, price : number, buyerAddress : Buffer) {

  console.log("invoking smart contract now. YAY!!");

  // Establish connection to the cluster
  await establishConnection();

  //Transfer Sol from listing account to Rewards, Biz and Treasury
  await transferSolFromListing(destAddress, price);

  


  // // Determine who pays for the fees
  // await establishPayer();

  // // Check if the program has been deployed
  await checkProgram();

  //Increment purchase via smart contract
  await recordPurchase(buyerAddress);

  // // Say hello to an account
  // await sayHello();

  // Find out how many times that account has been greeted
  //await reportPurchases();

  // //attempt to transfer solana from one account to another :P
  // await transferSol();

    console.log('Success');
}


/**
 * Report the number of times the greeted account has been said hello to
 */
 export async function reportPurchases(): Promise<void> {
  const accountInfo = await connection.getAccountInfo(greetedPubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  const greeting = borsh.deserialize(
    RewardSchema,
    RewardAccount,
    accountInfo.data,
  );
  console.log(
    greetedPubkey.toBase58(),
    'has been greeted',
    greeting.counter,
    'time(s)',
  );
  console.log(greeting);
}


/**
 * Record Purchase
 */
 export async function recordPurchase(buyer_addr : Buffer): Promise<void> {
  console.log('Recording purchase to', greetedPubkey.toBase58());
  // let addstr = buyer_addr.toString();
  const instruction = new TransactionInstruction({
    keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
    programId,
    data: buyer_addr, // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [listingKeypair],//[payer],
  );
}


/**
 * Establish a connection to the cluster
 */
 export async function establishConnection(): Promise<void> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
  }



/**
 * Sending Sol from Listing account to Rewards, Biz and Treasury
 */
export async function transferSolFromListing(listingAddress : String, listingPrice : number): Promise<void> {

  const LISTING_FILE = 'listing_'+listingAddress+'.json';
  const REWARD_FILE = 'reward_'+listingAddress+'.json';
  
  //Getting key-pairs of accounts
  try {
    listingKeypair = await createKeypairFromFile(LISTING_FILE, 'wallet');
    rewardKeypair = await createKeypairFromFile(REWARD_FILE, 'wallet');
  }catch (e) {
    console.error(e);
    console.log("error in getting keypair for :"+listingAddress)
  }
 
  // console.log(listingKeypair);
  // return;

  var listingAccountInfo = await connection.getAccountInfo(listingKeypair.publicKey);
  console.log("listing lamports at start:"+ listingAccountInfo?.lamports);
    
  let treasuryAmt = 0.01*listingPrice*LAMPORTS_PER_SOL ;
  let rewardAmt = 0.05*listingPrice*LAMPORTS_PER_SOL ;

  /**
  /*4% of price is left in the account as caution to cover fees. Total caution will be transferred to business on account closure
  */
  let bizAmt = 0.90*listingPrice*LAMPORTS_PER_SOL; 
   

  const instruction1 = SystemProgram.transfer({
    fromPubkey: listingKeypair.publicKey,
    toPubkey: EARP_TREASURY_PUBLIC_KEY,//Treasury
    lamports : treasuryAmt, 
  });

  const instruction2 = SystemProgram.transfer({
    fromPubkey: listingKeypair.publicKey,
    toPubkey: BUSINESS_PUBLIC_KEY,//Business
    lamports : bizAmt, 
  });

  const instruction3 = SystemProgram.transfer({
    fromPubkey: listingKeypair.publicKey,
    toPubkey: rewardKeypair.publicKey,//Reward
    lamports : rewardAmt, 
  });

  const transactions = new Transaction();
  transactions.add(instruction1);
  transactions.add(instruction2);
  transactions.add(instruction3);

  // const signature = await sendAndConfirmTransaction(
  //   connection,
  //   transactions,
  //   [listingKeypair],
  // );

  // console.log("transfer signature :"+signature);
  console.log("listing lamports at end:"+ listingAccountInfo?.lamports);
  
}



export async function newAccountWithLamports(
  connection: Connection,
  lamports = 1000000,
): Promise<Keypair> {
  const keypair = Keypair.generate();
  const signature = await connection.requestAirdrop(
    keypair.publicKey,
    lamports,
  );
  await connection.confirmTransaction(signature);
  return keypair;
}
  
/**
 * @private
 */
async function getConfig(): Promise<any> {
  // Path to Solana CLI config file
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
  );
  const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
  return yaml.parse(configYml);
}
  
/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('Missing RPC URL');
    console.log("json rpc url : "+config.json_rpc_url);
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost',
    );
    return 'http://localhost:8899';
  }
}
  
/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return createKeypairFromFile(config.keypair_path, '');
  } catch (err) {
    console.warn(
      'Failed to create keypair from CLI config file, falling back to new random keypair',
    );
    return Keypair.generate();
  }
}
  

const loadKeyString = (file : string, path: string) => fetch(`/key-string?f=${encodeURIComponent(file)}&p=${encodeURIComponent(path)}`)
                        .then(res => (res.ok ? res : Promise.reject(res)))
                        .then(res => res.json())


  /**
   * Create a Keypair from a secret key stored in file as bytes' array
   */
  export async function createKeypairFromFile(fileName: string, path : string|null): Promise<Keypair> {

    if (!path) { path = 'wallet'; }
    
    const secretKeyString = await loadKeyString(fileName, path);
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));

    return Keypair.fromSecretKey(secretKey);
  }
  

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  
  // Read program id from keypair file
  try {
    programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR, 'program');
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy sol_ear.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    // if (fs.existsSync(PROGRAM_SO_PATH)) {
    //   throw new Error(
    //     'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
    //   );
    // } else {
    throw new Error('Program needs to be built and deployed');
    // }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }

  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = 'registry';
  greetedPubkey = await PublicKey.createWithSeed(
    listingKeypair.publicKey,
    GREETING_SEED,
    programId,
  );

  // Check if the greeting account has already been created
  const greetedAccount = await connection.getAccountInfo(greetedPubkey);
  if (greetedAccount === null) {
    console.log(
      'Creating account',
      greetedPubkey.toBase58(),
      'to say hello to',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      REWARD_ACCOUNT_SIZE,
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: listingKeypair.publicKey,
        basePubkey: listingKeypair.publicKey,
        seed: GREETING_SEED,
        newAccountPubkey: greetedPubkey,
        lamports,
        space: REWARD_ACCOUNT_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [listingKeypair]);
  }
}