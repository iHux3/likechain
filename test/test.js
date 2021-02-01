const LikeToken = artifacts.require("./LikeToken.sol");
const LikeChain = artifacts.require("./LikeChain.sol");

contract(LikeChain, () => {
    it('... should', async() => {
        const likeToken = await LikeToken.deployed();
        const likeChain = await LikeChain.deployed();
        const admin = await likeToken.admin();
        assert.equal(admin, LikeChain.address, 'wrong admin');
    });
});
