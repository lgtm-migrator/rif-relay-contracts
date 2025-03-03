const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).parserConfiguration({
    'parse-numbers': false
}).argv;

const { getTestTokenInstance } = require('./utils');

module.exports = async (callback) => {
    const accounts = await web3.eth.getAccounts();
    const defaultReceiver = accounts[0];
    const defaultAmount = web3.utils.toWei('1', 'ether');
    const { tokenReceiver = defaultReceiver, amount = defaultAmount } = argv;
    if (!web3.utils.isAddress(tokenReceiver)) {
        callback(
            new Error(`invalid "tokenReceiver" address: ${tokenReceiver}`)
        );
    }
    console.log(
        `Minting ${amount} tokens and transferring them to ${tokenReceiver}...`
    );
    const testTokenInstance = await getTestTokenInstance(artifacts);
    const balanceBefore = await testTokenInstance.balanceOf(tokenReceiver);
    console.log(`Balance before: ${balanceBefore}`);
    const tx = await testTokenInstance.mint(amount, tokenReceiver);
    if (!tx.receipt || !tx.receipt.status) {
        callback(new Error(`Transaction ${tx.tx} failed`));
    }
    const balanceAfter = await testTokenInstance.balanceOf(tokenReceiver);
    console.log(`Balance after: ${balanceAfter}`);
    callback();
};
