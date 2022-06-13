import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const deployerAddress = "ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE";

const daoAddress = deployerAddress + ".executor-dao";
const bootstrapAddress = deployerAddress + ".agp000-bootstrap";
const agp029Address = deployerAddress + ".agp029";               
const agp030Address = deployerAddress + ".agp030";   
const agp031Address = deployerAddress + ".agp031";   
const agp035Address = deployerAddress + ".agp035";    
const agp036Address = deployerAddress + ".agp036";   
const agp039Address = deployerAddress + ".agp039";   
const age004Address = deployerAddress + ".age004-claim-and-stake";
const age003Address = deployerAddress + ".age003-emergency-execute";
class DAO {
  chain: Chain;
  deployer: Account;

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain;
    this.deployer = deployer;
  }

  construct(sender: Account, contract: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall(
        "executor-dao",
        "construct",
        [types.principal(contract)],
        sender.address
      ),
    ]);
    return block.receipts[0].result;
  }

  executiveAction(sender: Account, contract: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall(
        "age003-emergency-execute",
        "executive-action",
        [types.principal(contract)],
        sender.address
      ),
    ]);
    return block.receipts[0].result;
  }

  transferToken(
    sender: Account,
    token: string,
    amount: number,
    receiver: string,
    memo: ArrayBuffer
  ) {
    let block = this.chain.mineBlock([
      Tx.contractCall(
        token,
        "transfer-fixed",
        [
          types.uint(amount),
          types.principal(sender.address),
          types.principal(receiver),
          types.some(types.buff(memo)),
        ],
        sender.address
      ),
    ]);
    return block.receipts[0].result;
  }

  mintToken(
    sender: Account,
    token: string,
    amount: number,
    receiver: string
  ) {
    let block = this.chain.mineBlock([
      Tx.contractCall(
        token,
        "mint-fixed",
        [
          types.uint(amount),
          types.principal(receiver)
        ],
        sender.address
      ),
    ]);
    return block.receipts[0].result;
  }  
}

/**
 * dao test cases
 *
 */

Clarinet.test({
  name: "DAO: agp029/30/31",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk();

    result = await DAOTest.transferToken(
      deployer,
      "token-wstx",
      1_000_000e8,
      daoAddress,
      new ArrayBuffer(4)
    );
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-banana",
      50_000e8,
      daoAddress
    );
    result.expectOk();    

    result = await DAOTest.executiveAction(deployer, agp029Address);
    result.expectOk();
    result = await DAOTest.executiveAction(deployer, agp030Address);
    result.expectOk();    
    result = await DAOTest.executiveAction(deployer, agp031Address);
    result.expectOk();    


    let call = chain.callReadOnlyFn(
      "alex-launchpad-v1-1",
      "get-ido",
      [types.uint(0)],
      deployer.address
    );
    call.result.expectOk().expectSome();
    console.log(call.result);
  },
});

 Clarinet.test({
  name: "DAO: agp035/36",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-banana",
      50_000e8,
      daoAddress
    );
    result.expectOk();    

    result = await DAOTest.executiveAction(deployer, agp035Address);
    result.expectOk();
    result = await DAOTest.executiveAction(deployer, agp036Address);
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp039",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, agp039Address);
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp039",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, agp039Address);
    result.expectOk();

    let call: any = chain.callReadOnlyFn("age004-claim-and-stake", "buff-to-uint", [types.buff(new Uint8Array([0x01]).buffer)], deployer.address);
    call.result.expectUint(1);

    result = chain.mineBlock([
      Tx.contractCall("age004-claim-and-stake", "claim-and-stake", 
      [
        types.principal(age003Address),
        types.buff(new Uint8Array([0x01]).buffer)
      ], deployer.address),
      Tx.contractCall("age004-claim-and-stake", "claim-and-stake", 
      [
        types.principal(age004Address),
        types.buff(new Uint8Array([0x01]).buffer)
      ], deployer.address)      
    ]);
    result.receipts[0].result.expectErr().expectUint(3000);
    result.receipts[1].result.expectErr().expectUint(2026);
  },
});

Clarinet.test({
  name: "DAO: agp040",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployerAddress + ".agp040");
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp042",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-usda",
      100_000e8,
      daoAddress
    );
    result.expectOk();    

    result = await DAOTest.executiveAction(deployer, deployerAddress + ".agp042");
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp044",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp044");
    result.expectOk();

    let call: any = chain.callReadOnlyFn("age005-claim-and-stake", "buff-to-uint", [types.buff(new Uint8Array([0x01]).buffer)], deployer.address);
    call.result.expectUint(1);

    result = chain.mineBlock([
      Tx.contractCall("age005-claim-and-stake", "claim-and-stake", 
      [
        types.principal(age003Address),
        types.buff(new Uint8Array([0x01]).buffer)
      ], deployer.address),
      Tx.contractCall("age005-claim-and-stake", "claim-and-stake", 
      [
        types.principal(deployer.address + ".age005-claim-and-stake"),
        types.buff(new Uint8Array([0x01]).buffer)
      ], deployer.address)      
    ]);
    result.receipts[0].result.expectErr().expectUint(3000);
    result.receipts[1].result.expectErr().expectUint(2026);
  },
});

Clarinet.test({
    name: "DAO: agp045",

    async fn(chain: Chain, accounts: Map<string, Account>) {
      let deployer = accounts.get("deployer")!;
      let DAOTest = new DAO(chain, deployer);
  
      let result: any = await DAOTest.construct(deployer, bootstrapAddress);  
      result.expectOk();  

      result = await DAOTest.executiveAction(deployer, deployerAddress + ".agp045");    
      result.expectOk();
    },
  });          

Clarinet.test({
  name: "DAO: agp046",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-slime",
      360_000e8,
      daoAddress
    );
    result.expectOk();    

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp046");
    result.expectOk();
  },
});

// Clarinet.test({
//   name: "DAO: agp047/049",

//   async fn(chain: Chain, accounts: Map<string, Account>) {
//     let deployer = accounts.get("deployer")!;
//     let DAOTest = new DAO(chain, deployer);

//     let result: any = await DAOTest.construct(deployer, bootstrapAddress);
//     result.expectOk();

//     result = await DAOTest.mintToken(
//       deployer,
//       "age000-governance-token",
//       200_000e8,
//       daoAddress
//     );
//     result.expectOk();
//     let block = chain.mineBlock(
//       [
//       Tx.contractCall("alex-reserve-pool", "add-token", 
//         [types.principal(deployer.address + ".age000-governance-token")],
//         deployer.address
//       ),
//       Tx.contractCall("alex-reserve-pool", "set-activation-block",
//         [
//           types.principal(deployer.address + ".age000-governance-token"),
//           types.uint(0)
//         ],
//         deployer.address
//       ),
//       Tx.contractCall("alex-reserve-pool", "set-coinbase-amount",
//         [
//           types.principal(deployer.address + ".age000-governance-token"),
//           types.uint(1e8),
//           types.uint(1e8),
//           types.uint(1e8),
//           types.uint(1e8),
//           types.uint(1e8),
//         ],
//         deployer.address
//       )
//       ]
//     );
//     block.receipts.forEach((e) => { e.result.expectOk() });    

//     result = await DAOTest.executiveAction(deployer, deployer.address + ".agp039");
//     result.expectOk();

//     result = await DAOTest.executiveAction(deployer, deployer.address + ".agp047");
//     result.expectOk();    
//     chain.mineEmptyBlockUntil(57626);

//     result = await DAOTest.executiveAction(deployer, deployer.address + ".agp049");
//     result.expectOk();    
//   },
// });

Clarinet.test({
  name: "DAO: agp052",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.transferToken(
      deployer,
      "token-wstx",
      50_000e8,
      daoAddress,
      new ArrayBuffer(4)
    );
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-xusd",
      50_000e8,
      daoAddress
    );
    result.expectOk();     

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp052");
    result.expectOk();

  },
});

Clarinet.test({
  name: "DAO: agp053/54/55",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp053");
    result.expectOk();

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp054");
    result.expectOk();    
    // result = await DAOTest.executiveAction(deployer, deployer.address + ".agp055");
    // result.expectOk();        
  },
});

Clarinet.test({
  name: "DAO: agp058/59",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp058");
    result.expectOk();   
    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp059");
    result.expectOk();       
  },
});

Clarinet.test({
  name: "DAO: agp060/062",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp060");
    result.expectOk();
    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp062");
    result.expectOk();    
  },
});

Clarinet.test({
  name: "DAO: agp061",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.transferToken(
      deployer,
      "token-wstx",
      9165650000000 + 9165650000000,
      daoAddress,
      new ArrayBuffer(4)
    );
    result.expectOk();

    result = await DAOTest.mintToken(
      deployer,
      "token-mia",
      2688911400000000,
      daoAddress
    );
    result.expectOk();      

    result = await DAOTest.mintToken(
      deployer,
      "token-nycc",
      6318941800000000,
      daoAddress
    );
    result.expectOk();        

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp061");
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp063",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp063");
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp064",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp064");
    result.expectOk();
  },
});

Clarinet.test({
  name: "DAO: agp065",

  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let DAOTest = new DAO(chain, deployer);

    let result: any = await DAOTest.construct(deployer, bootstrapAddress);
    result.expectOk(); 

    result = await DAOTest.executiveAction(deployer, deployer.address + ".agp065");
    result.expectOk();
  },
});
