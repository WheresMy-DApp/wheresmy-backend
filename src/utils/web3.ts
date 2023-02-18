import Web3 from "web3";
import dotenv from 'dotenv';

dotenv.config();

import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";

import { abi } from './abis/WheresMyNFT';

const address = process.env.CONTRACT_ADDRESS;
const ABI = abi();
const privateKey = process.env.PRIVATE_KEY;
const ethnode = process.env.ETHNODE;

// const PK = 'your_channel_address_secret_key'; // channel private key
const Pkey = `0x${privateKey!}`;
const signer = new ethers.Wallet(Pkey);


export class Web3Notification {
    toAddress: string
    title: string
    body: string
    cta: any
    img: string

    constructor(toAddress: string, title: string, body: string, cta: any, img: string) {
        this.toAddress = toAddress;
        this.title = title;
        this.body = body;
        this.cta = cta;
        this.img = img;
    }
}

export default class Web3Utils {
    static async getTransaction(txhash: string) {
        const web3 = new Web3(new Web3.providers.HttpProvider(ethnode!))
        var tx = await web3.eth.getTransaction(txhash)
        if (tx.blockHash) return true;
        return false;
    }

    static async foundDevicePing(_deviceHash: string, _locationCode: string, _timestamp: number) {
        const web3 = new Web3(new Web3.providers.HttpProvider(ethnode!))
        const contract = await new web3.eth.Contract(ABI.abi as any, address);
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
    }

    static async sendNotification(notif: Web3Notification) {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(ethnode!))
            const account = web3.eth.accounts.privateKeyToAccount(privateKey!);
            const apiResponse = await PushAPI.payloads.sendNotification({
                signer,
                type: 3, // target
                identityType: 2, // direct payload
                notification: {
                    title: notif.title,
                    body: notif.body,
                },
                payload: {
                    title: notif.title,
                    body: notif.body,
                    cta: notif.cta,
                    img: notif.img,
                },
                recipients: `eip155:80001:${notif.toAddress}`, // recipient address
                channel: `eip155:80001:${account.address}`, // your channel address
                env: 'staging'
            });

            // apiResponse?.status === 204, if sent successfully!
            console.log('API repsonse: ', apiResponse);
        } catch (err) {
            console.error('Error: ', err);
        }
    }

}