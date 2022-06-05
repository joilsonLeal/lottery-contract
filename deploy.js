const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const { abi, evm } = require('./compile');
const { mnemonic, infuraEndpoint } = require("./config");

const provider = new HDWalletProvider(mnemonic, infuraEndpoint);

const web3 = new Web3(provider);

(async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account:", accounts[0]);

  const transaction = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to:", transaction.options.address);

  provider.engine.stop();
  process.exit(1);
})();
