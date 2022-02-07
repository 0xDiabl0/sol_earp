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

/**
 * In this test, we will try to create a Vault token account and send tokens from Vault to user .
 */
describe('vault', () => {

    console.log("inside vault js");

    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Vault;

    console.log(program.programId.toString());


    //declaring variables
    let mintA = null;
    let vaultTokenAccountA = null;
    let vault_account_pda = null;
    let vault_account_bump = null;
    
    
    const payer = anchor.web3.Keypair.generate();
    const mintAuthority = anchor.web3.Keypair.generate();
    

    // console.log("escrow: "+escrowAccount.publicKey.toString());
    console.log("payer: "+payer.publicKey.toString());
    console.log("mintAuth: "+mintAuthority.publicKey.toString());
    // console.log("initializerMainAcc: "+initializerMainAccount.publicKey.toString());
    // console.log("takerMainAcc: "+takerMainAccount.publicKey.toString());


    it("It initializes the account", async () => {

        //Requesting airdrop to payer account
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(payer.publicKey, 1000000000),
            "processed"
        );

       
        //creating a new SPL Token
        mintA = await Token.createMint(
            provider.connection,
            payer,
            mintAuthority.publicKey,
            null,
            0,
            TOKEN_PROGRAM_ID
        );

        console.log("mint: "+mintA.publicKey.toString());

        console.log("*****programId:"+ program.programId.toString());

        //creating a PDA to own TokenAccount
        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [
                // payer.publicKey.toBuffer(), 
                Buffer.from(anchor.utils.bytes.utf8.encode("vault-owner1"))
            ],
            program.programId
        );

        vault_account_pda = _vault_account_pda;
        vault_account_bump = _vault_account_bump;

        console.log("vault PDA:",vault_account_pda.toBase58());
        console.log("vault bump:",vault_account_bump);
        // return;


        // //Creating an associated account to hold newly Minted token
        vaultTokenAccountA = await mintA.createAccount(vault_account_pda);

        // //minting the token 
        await mintA.mintTo(
            vaultTokenAccountA,
            mintAuthority.publicKey,
            [mintAuthority],
            100 //hardcoded 100 tokens to be minted to the Vault account
        );

        console.log("vault token account : "+vaultTokenAccountA.toString());


        let _initializerTokenAccountA = await mintA.getAccountInfo(vaultTokenAccountA);

        assert.ok(_initializerTokenAccountA.amount.toNumber() == 100);

    });


    it("It init escrow account", async () => {

        return;
        
        await program.rpc.initialize(
            vault_account_bump,
            {
              accounts: {
                initializer: initializerMainAccount.publicKey,
                mint: mintA.publicKey,
                vaultAccount: vault_account_pda,
                initializerTokenAccount: initializerTokenAccountA,
                escrowAccount: escrowAccount.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
              },
              instructions: [
                await program.account.escrowAccount.createInstruction(escrowAccount),
              ],
              signers: [escrowAccount, initializerMainAccount],
            }
        );

    });

    it("It sends Tokens ", async () => {

        // return;

        var userMainAccount = anchor.web3.Keypair.generate();
        console.log("userMainAccount : "+userMainAccount.publicKey.toString());

        //Airdropping some money to userMainAccount
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(userMainAccount.publicKey, 1000000000),
            "processed"
        );

        var tokenKey = mintA.publicKey;
        
        let ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            tokenKey, // mint
            userMainAccount.publicKey // owner
        );
        console.log(`ATA: ${ata.toBase58()}`);


        //creating the associated token account for user
        await provider.send(
            (() => {
                const tx = new Transaction();
                tx.add(
                    Token.createAssociatedTokenAccountInstruction(
                        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
                        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                        tokenKey, // mint
                        ata, // ata
                        userMainAccount.publicKey, // owner of token account
                        userMainAccount.publicKey // fee payer
                      )
                );
                return tx;
            })(),
            [userMainAccount]
        );

       
        var amountToSend = new anchor.BN(5);

        console.log("checking authority");
        console.log("vault authority :"+vault_account_pda.toString());

        await program.rpc.sendTokens(
            amountToSend,
            vault_account_bump,
            {
                accounts: {
                    user: userMainAccount.publicKey,
                    mint: tokenKey,
                    userAccount: ata,
                    vaultAccount: vaultTokenAccountA,
                    vaultAuthority: vault_account_pda,
                    // escrowAccount: escrow_key,
                    payer: payer.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram : ASSOCIATED_TOKEN_PROGRAM_ID
                },
                signers: [userMainAccount, payer],
            }
        );

    });


});