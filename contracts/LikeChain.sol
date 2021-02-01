// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import './LikeToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract LikeChain
{
    using SafeMath for uint;
    
    uint public imageId;
    uint public totalLikes;
    uint lastReward;
    LikeToken likeToken;

    address[] userArray;
    mapping(address => User) users;
    mapping(uint => Image) images;

    struct User {
        uint[] images;
        uint[] liked;
    }

    struct Image {
        string IPFShash;
        string description;
        uint likesCount;
        address[] likes;
    }

    constructor(address _likeToken) 
    {
        likeToken = LikeToken(_likeToken);
    }
  
    function uploadImage(string calldata _IPFShash, string calldata _description) external 
    {
        require(bytes(_IPFShash).length <= 50, 'IPFShash length is too big');
        require(bytes(_description).length <= 100, 'Description length is too big');
        
        createUser();
        createImage(_IPFShash, _description);
    }

    function likeImage() external
    {
        rewardDonators();
    }

    function rewardDonators() private 
    {
        uint rewardCount = block.timestamp.sub(lastReward).div(1 days);
        lastReward += rewardCount * 1 days;
        while (rewardCount > 0) {
            //reward
            rewardCount.sub(1);
        }
    }

    function createUser() private
    {
        if (users[msg.sender].images.length == 0 && users[msg.sender].liked.length == 0) {
            userArray.push(msg.sender);
        }
    }

    function createImage(string calldata _IPFShash, string calldata _description) private
    {
        users[msg.sender].images.push(imageId);
        images[imageId] = Image(_IPFShash, _description, 0, new address[](0));
        imageId++;
    }
}