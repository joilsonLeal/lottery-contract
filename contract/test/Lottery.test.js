const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let accounts;
let lottery;
let manager;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  manager = accounts[0];

  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: "1000000", from: manager });
});

describe("Lottery Contract", () => {
  it("should deploy a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("should allow one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.01", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(players.length, 1);
    assert.equal(players[0], accounts[0]);
  });

  it("should allow multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.01", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.01", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(players.length, 2);
    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
  });

  it("should revert if ether value is below 0.01", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.001", "ether"),
      });
      assert(false);
    } catch (error) {
      assert(error);
      assert.equal(
        error.message,
        "VM Exception while processing transaction: revert You must enter at least 0.01 ether!"
      );
    }
  });

  it("should revert if someone that isn't the manager calls pickWinner", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.01", "ether"),
      });

      await lottery.methods.pickWinner().call({
        from: accounts[1],
      });

      assert(false);
    } catch (error) {
      assert(error);
      assert.equal(
        error.message,
        "VM Exception while processing transaction: revert Must be the manager to call this function!"
      );
    }
  });

  it("should sends money to the winner and resets the players array", async () => {
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await lottery.methods.pickWinner().call({
      from: manager,
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    
    const difference = initialBalance - finalBalance;

    assert(difference > web3.utils.toWei("9.8", "ether"));
  });
});
