const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

//user PDA 56CcmTNYpBBroJKu5ZooKDWvLo6CtVc3vheKd4uorF8o

describe('publishincentive', () => {

  return;


  console.log("inside publishincentive js");
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Publishincentive;
  console.log(program.programId.toString());

  it("It initializes the account", async () => {
    
    console.log("wallkey:"+provider.wallet.publicKey);
    
    const biz1 = anchor.web3.Keypair.generate();
    console.log("biz1 :"+biz1.publicKey);

    const usr1 = anchor.web3.Keypair.generate();
    console.log("usr1 :"+usr1.publicKey);
    
    const [incAccount, incAccountPDABump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("incentive")],
      program.programId
    );

    console.log("inc1 :"+incAccount);
    


    const [baseAccount, baseAccountPDABump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("usrReward")],
      program.programId
    );

    console.log("BAkey:"+baseAccount);

    // await program.rpc.initialize(baseAccountPDABump, biz1.publicKey.toString(), incAccount.toString(), usr1.publicKey.toString() , {
    //   accounts: {
    //     rewardAccount: baseAccount,
    //     user: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [],
    // });

    const account = await program.account.baseAccount.fetch(baseAccount);
    console.log('Data: ', account);
    // assert.ok(account.data === "");
    _baseAccount = baseAccount;

  });

  it("Updates a previously created account", async () => {
    const baseAccount = _baseAccount;

    await program.rpc.pushincentives( 3, {
      accounts: {
        rewardAccount: baseAccount,
      },
    });

    const account = await program.account.baseAccount.fetch(baseAccount);
    // console.log('Updated data: ', account.data)
    // assert.ok(account.data === "Some new data");
    console.log('all account data:', account)
    console.log('All data: ', account.userReward);
    assert.ok(account.userReward === 3);
  });
});
