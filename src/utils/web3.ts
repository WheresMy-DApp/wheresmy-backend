import Web3 from "web3";
const address = process.env.CONTRACT_ADDRESS;
const ABI = require("src/utils/abis/WheresMyNFT.json");
const privateKey = process.env.PRIVATE_KEY;
const ethnode = process.env.ETHNODE;

module.exports = {
    getTransaction: async (txhash: string) => {
        const web3 = new Web3(new Web3.providers.HttpProvider(ethnode!))
        var tx = await web3.eth.getTransaction(txhash)
        if (tx.blockHash) return true;
        return false;
    },
    foundDevicePing: async (_deviceHash: string, _locationCode: string, _timestamp: number) => {
        const web3 = new Web3(new Web3.providers.HttpProvider(ethnode!))
        const contract = await new web3.eth.Contract(ABI.abi, address);
        const account = web3.eth.accounts.privateKeyToAccount(privateKey!)
        const transaction = contract.methods.foundDevicePing(_deviceHash, _locationCode, _timestamp);
        const options = {
            to: address,
            data: transaction.encodeABI(),
            gas: await transaction.estimateGas({ from: account.address }) + 2000,
            gasPrice: await web3.eth.getGasPrice() // or use some predefined value
        };
        const signed = await web3.eth.accounts.signTransaction(options, privateKey!);
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction!);
        return (receipt)
    },
    // giveLicense: async (buyer, sid) => {
    //     const web3 = new Web3(new Web3.providers.HttpProvider(ethnode))
    //     const contract = await new web3.eth.Contract(ABI.abi, address);
    //     const account = web3.eth.accounts.privateKeyToAccount(privateKey)
    //     const transaction = contract.methods.giveLicense(buyer, sid, buyer);
    //     const options = {
    //         to: address,
    //         data: transaction.encodeABI(),
    //         gas: await transaction.estimateGas({ from: account.address }) + 2000,
    //         gasPrice: await web3.eth.getGasPrice() // or use some predefined value
    //     };
    //     const signed = await web3.eth.accounts.signTransaction(options, privateKey);
    //     const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    //     return (receipt)
    // }
}