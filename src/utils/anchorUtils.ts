import { WalletContextState } from '@solana/wallet-adapter-react';
import { Provider } from '@project-serum/anchor';
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  Keypair,
  Connection,
  PublicKey,
  // LAMPORTS_PER_SOL,
  // SystemProgram,
  // TransactionInstruction,
  Transaction,
  // sendAndConfirmTransaction,
  Commitment,
  ConfirmOptions,
} from '@solana/web3.js';


let processedCommitment : Commitment;
processedCommitment = "processed";

let opts : ConfirmOptions;
opts = {
  preflightCommitment: processedCommitment
}


/**
 * Returns the PDA details for a given listing
 * @param listingKeypair 
 * @returns 
 */
export async function getPDAfromListing(listingKeypair : Keypair, programId : PublicKey) {
  
  let accountPDA;

  if (!listingKeypair) 
    throw new Error("listing keypair is null");

  // let publicKeyStr = listingKeypair.publicKey.toBase58().substr(0,32);
  // let greetedPubSeed = Buffer.from(publicKeyStr, 'utf8');

  //HARD CODED PDA seed for now. should ideally be derived from listing key
  let greetedPubSeed = Buffer.from("registry", 'utf8');
  
  accountPDA = await PublicKey.findProgramAddress([greetedPubSeed], programId);

  return accountPDA;
}


export async function getProvider(wallet : WalletContextState){
  
  const network = "http://127.0.0.1:8899";
  const connection = new Connection(network, "processed");

  // const userwallet = useWallet();
  let wallet1 = new tWallet(wallet);

  if (!opts.preflightCommitment)
    throw new Error("empty preflight commitment");

  const provider = new Provider(connection, wallet1, opts);

  return provider;
}


// const userwallet = useWallet();
const kp = new Keypair();

export class tWallet extends NodeWallet {
  
  public userwallet : WalletContextState;

  // constructor(readonly payer: Keypair) {}
  constructor(wallet : WalletContextState) {
    super(kp);

    if (!wallet)
      throw new Error("wallet undefined..");
    
    this.userwallet = wallet;

    if (!this.userwallet)
      throw new Error("wallet undefined..");
  }


  async signTransaction(tx: Transaction): Promise<Transaction> {
    
    let x = tx;

    if (this.userwallet.signTransaction)
      return this.userwallet.signTransaction(tx);

    return x;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    
    let x = txs;
    
    if (this.userwallet.signAllTransactions)
      return this.userwallet.signAllTransactions(txs);

    return x;
  }

  get publicKey(): PublicKey {
    
    let pk = this.userwallet.publicKey;
    if (!pk)
      throw new Error("public key is null");

    return pk;
  }
}