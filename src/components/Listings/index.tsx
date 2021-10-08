import React, { useCallback } from "react";
import { useConnection, sendTransaction } from "../../contexts/connection";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction, } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { LABELS } from "../../constants";
import Wallet from "@project-serum/sol-wallet-adapter";

import { Button, Col, Row } from "antd";
import { publicKey } from "../../utils/layout";
import EventEmitter from "eventemitter3";
import { invokeSmartContract } from "../../utils/programBridge";


export interface WalletAdapter extends EventEmitter {
  publicKey: PublicKey | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  connect: () => any;
  disconnect: () => any;
}

//export const Listings = (props: { left?: JSX.Element; right?: JSX.Element }) => {
export const Listings = (props: { price: number; destAddress: string }) => {

  console.log(props);

  const connection = useConnection();
  // const { publicKey } = useWallet();
  const wallet = useWallet();

  const purchaseListing = useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      
    e.preventDefault();

    let publicKey = wallet.publicKey;

    try {
        
      if (!publicKey) {
        return;
      }

      let publicKeyStr = publicKey.toBase58();
      var buf = Buffer.from(publicKeyStr, 'utf8');

      console.log("key is here:"+publicKeyStr);

      //await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);

      notify({
        message: LABELS.WALLET_APPROVE_PROMPT,
        type: "success",
      });
        

      const lamports = props.price * LAMPORTS_PER_SOL;
      const instruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(props.destAddress),
        lamports, 
      });
        

      let transaction = new Transaction();
      transaction.add(instruction);
      transaction.feePayer = wallet!.publicKey!;
      let hash = await connection.getRecentBlockhash();
      console.log("blockhash", hash);
      transaction.recentBlockhash = hash.blockhash;

      let signedTransaction = await wallet.signTransaction(transaction);
      //let sig = await connection.sendRawTransaction(signedTransaction.serialize());

      if (true) { //(sig.length>0) {
        console.log("payment successful");

        //   /**
        //    * invoke smart contract to do following
        //    * a) Transfer Sol from reciever account to 
        //    *    EAR treasury (fees | owned by EAR), Rewards (owned by EAR) and Business (owned by Biz)
        //    * b) Increment the purchase counter in tracker account (owned by EAR), Retrieve the latest count
        //    * c) Check the disbursal criteria and distribite rewards amount among early-adopters
        //    */
          
        //This timeout of 5sec is a hack to achive finality of transactions before distributing.
        let timeout = setTimeout(() => invokeSmartContract(props.destAddress, props.price, buf), 5000);
        
        notify({
          message: LABELS.SUCCESSFUL_PURCHASE,
          type: "success",
        });

      }
      else {
        throw new Error("wallet tranaction failed");
      }
        
    } 
    catch (error) {
      notify({
          message: LABELS.FAILED_PURCHASE,
          type: "error",
      });
      
      console.error(error);
    }
  }, [wallet, connection,]);


  return (
    <Col span={12} >
      <div className="white blacktext pad5">
        <div className="pad5">
          Buy my Book "How to win a hackathon"
          <br/><br/>
          <div className="graytext font13">
            EAR : 5% | Cutoff : 100
          </div>
          <br/>
        </div>
        
        <Button onClick={purchaseListing}> 
            <div className="blacktext">Buy {props.price} S◎l</div>
        </Button>
        <br/><br/>
      </div>
    </Col>
  );
};


