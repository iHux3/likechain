// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import './LikeToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract LikeChain
{
    using SafeMath for uint;

    uint public constant YIELD_PERCENT = 10 ** 15;
    uint public imageId;
    uint public totalLikes;

    LikeToken likeToken;
    address[] userArray;
    mapping(address => User) users;
    mapping(uint => Image) images;

    struct User {
        bool created;
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

    constructor(address _likeToken)
    {
        likeToken = LikeToken(_likeToken);
    }

    function uploadImage(string calldata _IPFShash, string calldata _description) external
    {
        require(bytes(_IPFShash).length <= 50, 'IPFSHASH_LENGTH_OVERFLOW');
        require(bytes(_description).length <= 100, 'DESCRIPTION_LENGTH_OVERFLOW');

        _createUser();
        _createImage(_IPFShash, _description);
    }

    function likeImage(uint _imageId) external
    {
        _createUser();
        _like(_imageId, 1 ether);
    }

    function withdrawYield() external
    {
        (uint yield, uint avg) = _calculateYield();
        if (yield == 0 && avg == 0) revert('NO_LIKED_IMAGES');
        if (yield == 0 && avg != 0) revert('NO_YIELD');

        User storage user = users[msg.sender];
        uint remainder = block.timestamp.sub(avg) % 1 days;
        user.likedTimestamps = user.likedCount * (block.timestamp - remainder);
        likeToken.mint(msg.sender, yield);
    }

    function _calculateYield() public view returns(uint, uint) 
    {
        User storage user = users[msg.sender];
        if (user.likedCount > 0) {
            uint avg = user.likedTimestamps.div(user.likedCount);
            uint daysCount = block.timestamp.sub(avg).div(1 days);
            uint yield = daysCount > 0 ? user.likedCount * YIELD_PERCENT ** daysCount : 0;
            return (yield, avg);
        } else {
            return (0, 0);
        }
    }

    function _createUser() private
    {
        if (users[msg.sender].created == false) {
            userArray.push(msg.sender);
            users[msg.sender].created = true;
        }
    }

    function _createImage(string calldata _IPFShash, string calldata _description) private
    {
        users[msg.sender].images.push(imageId);
        images[imageId] = Image(msg.sender, _IPFShash, _description, new address[](0));
        imageId++;
    }

    function _like(uint _imageId, uint _amount) private
    {
        require(likeToken.balanceOf(msg.sender) >= _amount, 'NO_TOKEN_BALANCE');
        require(likeToken.allowance(msg.sender, address(this)) >= _amount, 'NO_TOKEN_ALLOWANCE');
        require(users[msg.sender].liked[_imageId] == false, 'IMAGE_LIKED');

        likeToken.transferFrom(msg.sender, images[_imageId].author, _amount);
        users[msg.sender].liked[_imageId] = true;
        users[msg.sender].likedCount++;
        users[msg.sender].likedTimestamps += block.timestamp;
        images[_imageId].likes.push(msg.sender);
    }
}
