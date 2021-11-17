import { WalletContextState } from '@solana/wallet-adapter-react';
import { Provider } from '@project-serum/anchor';
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  Commitment,
  ConfirmOptions,
} from '@solana/web3.js';


let processedCommitment : Commitment;
processedCommitment = "processed";

let opts : ConfirmOptions;
opts = {
  preflightCommitment: processedCommitment
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
    this.userwallet = wallet;
  }


  async signTransaction(tx: Transaction): Promise<Transaction> {
    
    return this.userwallet.signTransaction(tx);
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    
    return this.userwallet.signAllTransactions(txs);
  }

  get publicKey(): PublicKey {
    
    let pk = this.userwallet.publicKey;
    if (!pk)
      throw new Error("public key is null");

    return pk;
  }
}