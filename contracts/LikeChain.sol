// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma abicoder v2;

import './LikeToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract LikeChain
{
    using SafeMath for uint;

    uint constant YIELD_PERCENT = 10 ** 15;
    uint constant YIELD_INTERVAL = 1 days;
    uint constant LIKE_VALUE = 1 ether;
    uint public imageId;

    LikeToken likeToken;
    mapping(address => User) public users;
    mapping(uint => Image) public images;

    struct User {
        uint likedTimestamps;
        uint likedCount;
        uint[] images;
        mapping(uint => bool) liked;
    }

    struct Image {
        address author;
        string IPFShash;
        string description;
        address[] likes;
    }

    event ImageCreated (
        uint id,
        address author,
        string IPFShash,
        string description
    );

    event ImageLiked (
        uint id,
        address user
    );

    constructor(address _likeToken)
    {
        likeToken = LikeToken(_likeToken);
    }

    function uploadImage(string calldata _IPFShash, string calldata _description) external
    {
        require(bytes(_IPFShash).length <= 50, 'IPFSHASH_LENGTH_OVERFLOW');
        require(bytes(_description).length <= 100, 'DESCRIPTION_LENGTH_OVERFLOW');

        users[msg.sender].images.push(imageId);
        images[imageId] = Image(msg.sender, _IPFShash, _description, new address[](0));
        emit ImageCreated(imageId, msg.sender, _IPFShash, _description);
        imageId++;
    }

    function likeImage(uint _imageId) external
    {
        require(likeToken.balanceOf(msg.sender) >= LIKE_VALUE, 'NO_TOKEN_BALANCE');
        require(likeToken.allowance(msg.sender, address(this)) >= LIKE_VALUE, 'NO_TOKEN_ALLOWANCE');
        require(users[msg.sender].liked[_imageId] == false, 'IMAGE_LIKED');

        likeToken.transferFrom(msg.sender, images[_imageId].author, LIKE_VALUE);
        users[msg.sender].liked[_imageId] = true;
        users[msg.sender].likedCount++;
        users[msg.sender].likedTimestamps += block.timestamp;
        images[_imageId].likes.push(msg.sender);
        emit ImageLiked(_imageId, msg.sender);
    }

    function withdrawYield() external
    {
        (uint yield, uint avg) = calculateYield();
        if (yield == 0 && avg == 0) revert('NO_LIKED_IMAGES');
        if (yield == 0 && avg != 0) revert('NO_YIELD');

        User storage user = users[msg.sender];
        uint remainder = block.timestamp.sub(avg) % YIELD_INTERVAL;
        user.likedTimestamps = user.likedCount * (block.timestamp - remainder);
        likeToken.mint(msg.sender, yield);
    }

    function calculateYield() public view returns(uint, uint) 
    {
        User storage user = users[msg.sender];
        if (user.likedCount > 0) {
            uint avg = user.likedTimestamps.div(user.likedCount);
            uint daysCount = block.timestamp.sub(avg).div(YIELD_INTERVAL);
            uint yield = daysCount > 0 ? user.likedCount * YIELD_PERCENT ** daysCount : 0;
            return (yield, avg);
        } else {
            return (0, 0);
        }
    }
}