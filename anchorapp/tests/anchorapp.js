const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe('anchorapp', () => {
  return;

  console.log("inside anchorapp js");
  // var x = camelCase("anchorapp", { pascalCase: true });
  // console.log("PascalCase Test :"+x);
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Anchorapp;
  console.log(program.programId.toString());

  it("It initializes the account", async () => {
    console.log("wallkey:"+provider.wallet.publicKey);
    
    // const baseAccount = anchor.web3.Keypair.generate();
    const [baseAccount, baseAccountPDABump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("registry")],
      program.programId
    );

    console.log("BAkey:"+baseAccount);

    // await program.rpc.initialize(baseAccountPDABump, {
    //   accounts: {
    //     baseAccount: baseAccount,
    //     user: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [],
    // });

    const account = await program.account.baseAccount.fetch(baseAccount);
    console.log('Data: ', account);
    // assert.ok(account.data === "Hello World");
    _baseAccount = baseAccount;

  });

  it("Updates a previously created account", async () => {
    const baseAccount = _baseAccount;

    await program.rpc.update("Some new data", {
      accounts: {
        baseAccount: baseAccount,
      },
    });

    const account = await program.account.baseAccount.fetch(baseAccount);
    // console.log('Updated data: ', account.data)
    // assert.ok(account.data === "Some new data");
    console.log('all account data:', account)
    console.log('All data: ', account.dataList);
    assert.ok(account.dataList.length != 0);
  });
});
