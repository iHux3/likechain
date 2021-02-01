const LikeToken = artifacts.require("./LikeToken.sol");
const LikeChain = artifacts.require("./LikeChain.sol");

module.exports = async function(deployer) {
    await deployer.deploy(LikeToken);
    await deployer.deploy(LikeChain, LikeToken.address);
    const likeToken = await LikeToken.deployed();
    await likeToken.setAdmin(LikeChain.address);
};
