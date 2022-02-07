const assert = require("assert");
const anchor = require("@project-serum/anchor");
const spl = require("@solana/spl-token");

const { SystemProgram } = anchor.web3;
const PublicKey = anchor.web3.PublicKey;
const Transaction = anchor.web3.Transaction;
const Connection = anchor.web3.Connection;
// const {Commitment} = anchor.web3.Commitment;

const Token = spl.Token;
const TOKEN_PROGRAM_ID = spl.TOKEN_PROGRAM_ID;
const ASSOCIATED_TOKEN_PROGRAM_ID = spl.ASSOCIATED_TOKEN_PROGRAM_ID;

describe('disbursereward', () => {

    return;

    console.log("inside disbursereward js");

    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Disbursereward;

    // console.log(program.programId.toString());


    //declaring variables
    let mintA = null;
    // let mintB = null;
    let initializerTokenAccountA = null;
    let vault_account_pda = null;
    let vault_account_bump = null;
    let vault_authority_pda = null;

    // const escrowAccount = anchor.web3.Keypair.generate();
    // const payer = anchor.web3.Keypair.generate();
    // const mintAuthority = anchor.web3.Keypair.generate();
    // const initializerMainAccount = anchor.web3.Keypair.generate();
    // const takerMainAccount = anchor.web3.Keypair.generate();

    // console.log("escrow: "+escrowAccount.publicKey.toString());
    // console.log("payer: "+payer.publicKey.toString());
    // console.log("mintAuth: "+mintAuthority.publicKey.toString());
    // console.log("initializerMainAcc: "+initializerMainAccount.publicKey.toString());
    // console.log("takerMainAcc: "+takerMainAccount.publicKey.toString());


    it("It initializes the account", async () => {

        //Requesting airdrop to payer account
        // await provider.connection.confirmTransaction(
        //     await provider.connection.requestAirdrop(payer.publicKey, 1000000000),
        //     "processed"
        // );

        
        //Transferring fund to business and user accounts
        // await provider.send(
        //     (() => {
        //       const tx = new Transaction();
        //       tx.add(
        //         SystemProgram.transfer({
        //           fromPubkey: payer.publicKey,
        //           toPubkey: initializerMainAccount.publicKey,
        //           lamports: 100000000,
        //         }),
        //         SystemProgram.transfer({
        //           fromPubkey: payer.publicKey,
        //           toPubkey: takerMainAccount.publicKey,
        //           lamports: 100000000,
        //         })
        //       );
        //       return tx;
        //     })(),
        //     [payer]
        // );

        //creating a new SPL Token
        // mintA = await Token.createMint(
        //     provider.connection,
        //     payer,
        //     mintAuthority.publicKey,
        //     null,
        //     0,
        //     TOKEN_PROGRAM_ID
        // );

        // console.log("mint: "+mintA.publicKey.toString());

        // //Creating an associated account to hold newly Minted token
        // initializerTokenAccountA = await mintA.createAccount(initializerMainAccount.publicKey);

        // //minting the token 
        // await mintA.mintTo(
        //     initializerTokenAccountA,
        //     mintAuthority.publicKey,
        //     [mintAuthority],
        //     100
        // );

        // console.log("initializer token account : "+initializerTokenAccountA.toString());


        // let _initializerTokenAccountA = await mintA.getAccountInfo(initializerTokenAccountA);

        // assert.ok(_initializerTokenAccountA.amount.toNumber() == 100);

    });


    it("It init escrow account", async () => {

        // const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
        //     [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed"))],
        //     program.programId
        // );

        // vault_account_pda = _vault_account_pda;
        // vault_account_bump = _vault_account_bump;

        // const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
        //     [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
        //     program.programId
        // );
        // vault_authority_pda = _vault_authority_pda;

        // console.log("vault PDA : "+vault_authority_pda.toString());

        // await program.rpc.initialize(
        //     vault_account_bump,
        //     {
        //       accounts: {
        //         initializer: initializerMainAccount.publicKey,
        //         mint: mintA.publicKey,
        //         vaultAccount: vault_account_pda,
        //         initializerTokenAccount: initializerTokenAccountA,
        //         escrowAccount: escrowAccount.publicKey,
        //         systemProgram: anchor.web3.SystemProgram.programId,
        //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        //         tokenProgram: TOKEN_PROGRAM_ID,
        //       },
        //       instructions: [
        //         await program.account.escrowAccount.createInstruction(escrowAccount),
        //       ],
        //       signers: [escrowAccount, initializerMainAccount],
        //     }
        // );

    });

    it("It sends Tokens ", async () => {

        var userMainAccount = anchor.web3.Keypair.generate();
        console.log("userAcc : "+userMainAccount.publicKey.toString());

        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(userMainAccount.publicKey, 1000000000),
            "processed"
        );

        var tokenKey = new PublicKey("5NLMZQFXGpZkEqzqs7Av5nWkuJhTpRqgb3tYDaQhTGin");
        var payer_key = new PublicKey("79EC2uCokFrBhMPb55kQ1huKjXD6XqKuWm2g3TKWUYx6");
        var escrow_key = new PublicKey("HFrdVgzGrTiatKhsVWDFZkzhWhaRrxiDDyz4EKEQBDE9");

        // tokenInfo = Token.getAccountInfo(tokenKey);
        var mintX = new Token(
            provider.connection,
            tokenKey,
            TOKEN_PROGRAM_ID,
            payer_key
        );
        
        console.log("mint pub key : "+mintX.publicKey.toString());

        // var user_token_acc = await mintX.createAssociatedTokenAccount(userMainAccount.publicKey);
        // console.log("user_token_acc pub key : "+user_token_acc.toString());


        let ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            tokenKey, // mint
            userMainAccount.publicKey // owner
        );
        console.log(`ATA: ${ata.toBase58()}`);

        // await provider.send(
        //     (() => {
        //         const tx = new Transaction();
        //         tx.add(
        //             Token.createAssociatedTokenAccountInstruction(
        //                 ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        //                 TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        //                 tokenKey, // mint
        //                 ata, // ata
        //                 userMainAccount.publicKey, // owner of token account
        //                 userMainAccount.publicKey // fee payer
        //               )
        //         );
        //         return tx;
        //     })(),
        //     [userMainAccount]
        // );


        // console.log(`txhash: ${await provider.connection.sendTransaction(tx, [payer_key])}`);


        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode("token-seed"))],
            program.programId
        );

        vault_account_pda = _vault_account_pda;
        vault_account_bump = _vault_account_bump;

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(anchor.utils.bytes.utf8.encode("escrow"))],
            program.programId
        );
        vault_authority_pda = _vault_authority_pda;

        console.log("vault acc PDA : "+vault_account_pda.toString());
        console.log("vault auth PDA : "+vault_authority_pda.toString());

        var amountToSend = new anchor.BN(5);

        await program.rpc.sendTokens(
            amountToSend,
            {
                accounts: {
                    user: userMainAccount.publicKey,
                    mint: tokenKey,
                    userAccount: ata,
                    vaultAccount: vault_account_pda,
                    vaultAuthority: vault_authority_pda,
                    escrowAccount: escrow_key,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram : ASSOCIATED_TOKEN_PROGRAM_ID
                },
                signers: [userMainAccount],
            }
        );

    });


});