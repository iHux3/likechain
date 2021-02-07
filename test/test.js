const LikeToken = artifacts.require("./LikeToken.sol");
const LikeChain = artifacts.require("./LikeChain.sol");

contract(LikeChain, (accounts) => {
    it('correct admin', async() => {
        const likeToken = await LikeToken.deployed();
        const likeChain = await LikeChain.deployed();
        const admin = await likeToken.admin();
        assert.equal(admin, LikeChain.address, 'wrong admin');
    });

    it('no-admin minting token reverts', async() => {
        const likeToken = await LikeToken.deployed();
        await reverts(likeToken.mint, accounts[0], web3.utils.toWei('1', 'ether'));
    });

    it('image upload reverts with too long hash', async() => {
        const likeChain = await LikeChain.deployed();
        let hash;
        for (let i = 0; i < 51; i++) hash += 'a';
        await reverts(likeChain.uploadImage, hash, 'desc');
    });

    it('image upload from accounts[1]', async() => {
        await uploadImage(0, accounts[1]);
    });

    it('image upload from accounts[2]', async() => {
        await uploadImage(1, accounts[2]);
    });

    it('withdrawing yield reverts (no liked images)', async() => {
        const likeChain = await LikeChain.deployed();
        await reverts(likeChain.withdrawYield);
    });

    it('like image 0', async() => {
        await likeImage(0, accounts[1]);
    });

    it('like image 1', async() => {
        await likeImage(1, accounts[2]);
    });

    it('liking the same image by same sender fails', async() => {
        const likeToken = await LikeToken.deployed();
        const likeChain = await LikeChain.deployed();
        const value = web3.utils.toWei('1', 'ether');
        await likeToken.approve(likeChain.address, value);
        await reverts(likeChain.likeImage, 0);
    });

    it('withdrawing yield reverts (no yield)', async() => {
        const likeChain = await LikeChain.deployed();
        await reverts(likeChain.withdrawYield);
    });

    it('withdrawing yield after 1 interval (testing 15s instead of 1 day)', async() => {
        await testWithdrawal(accounts, 1, '2000000000000000');
    });

    it('withdrawing yield reverts (no yield)', async() => {
        const likeChain = await LikeChain.deployed();
        await reverts(likeChain.withdrawYield);
    });

    it('withdrawing yield after 10 intervals (testing 15s instead of 1 day)', async() => {
        await testWithdrawal(accounts, 10, '22090240420504420');
    });
});

async function uploadImage(imageId, account) {
    const likeChain = await LikeChain.deployed();
    await likeChain.uploadImage('hash', 'desc', {from: account});
    const image = await likeChain.images(imageId);
    assert.equal(image.author, account, 'wrong author');
    assert.equal(image.IPFShash, 'hash', 'wrong hash');
    assert.equal(image.description, 'desc', 'wrong description');
}

async function likeImage(imageId, account) {
    const likeToken = await LikeToken.deployed();
    const likeChain = await LikeChain.deployed();
    const value = web3.utils.toWei('1', 'ether');
    await likeToken.approve(likeChain.address, value);
    await likeChain.likeImage(imageId);
    const authorBalance = await likeToken.balanceOf(account);
    assert.equal(authorBalance, value, 'wrong author balance');
}

async function testWithdrawal(accounts, intervalCount, expectedBalance) {
    const likeToken = await LikeToken.deployed();
    const likeChain = await LikeChain.deployed();
    await sleep(intervalCount * 15);
    await likeChain.withdrawYield();
    const startingBalance = new web3.utils.BN(web3.utils.toWei('9998', 'ether')); //10000 - 2 (spent for liking)
    let balance = await likeToken.balanceOf(accounts[0]);
    balance = balance.sub(startingBalance);
    assert.equal(balance.toString(), expectedBalance.toString(), 'wrong yield');
}

async function reverts(fnc, ...params) {
    let failed = false;
    try {
        await fnc(...params)
    } catch(e) {
        failed = true;
    }
    assert.equal(failed, true, 'did not revert');
}

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}