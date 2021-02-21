// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma abicoder v2;

import './LikeToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract LikeChain
{
    using SafeMath for uint;

    uint constant YIELD_VALUE = 10 ** 15;
    uint constant YIELD_INTERVAL = 15 seconds;
    uint constant LIKE_VALUE = 1 ether;
    uint constant FEE = 10 ** 17;
    uint public imageId;

    LikeToken likeToken;
    mapping(address => User) users;
    mapping(uint => Image) images;

    uint topImagesMinimum;
    uint currentRecentlyLiked;
    uint[] topImages;
    uint[] recentlyLiked;

    struct User {
        uint224 likedTimestamps;
        uint32 likedCount;
        uint[] images;
        mapping(uint => bool) liked;
    }

    struct Image {
        address author;
        string IPFShash;
        string description;
        uint likes;
    }

    event ImageUploaded (
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
        require(bytes(_IPFShash).length <= 60, 'IPFSHASH_LENGTH_OVERFLOW');
        require(bytes(_description).length <= 80, 'DESCRIPTION_LENGTH_OVERFLOW');

        users[msg.sender].images.push(imageId);
        images[imageId] = Image(msg.sender, _IPFShash, _description, 0);
        emit ImageUploaded(imageId, msg.sender, _IPFShash, _description);
        imageId++;
    }

    function likeImage(uint _imageId) external
    {
        require(_imageId < imageId, 'NO_ID_IMAGE');
        require(likeToken.balanceOf(msg.sender) >= LIKE_VALUE, 'NO_TOKEN_BALANCE');
        require(likeToken.allowance(msg.sender, address(this)) >= LIKE_VALUE, 'NO_TOKEN_ALLOWANCE');
        require(users[msg.sender].liked[_imageId] == false, 'IMAGE_LIKED');

        likeToken.transferFrom(msg.sender, images[_imageId].author, LIKE_VALUE.sub(FEE));
        likeToken.burn(msg.sender, FEE);

        users[msg.sender].liked[_imageId] = true;
        users[msg.sender].likedCount++;
        users[msg.sender].likedTimestamps += uint224(block.timestamp);
        images[_imageId].likes++;
        
        _updateTopImages(_imageId);
        _updateRecentlyLiked(_imageId);
        emit ImageLiked(_imageId, msg.sender);
    }

    function withdrawYield() external
    {
        (uint yield, uint avg) = calculateYield(msg.sender, block.timestamp);
        if (yield == 0 && avg == 0) revert('NO_LIKED_IMAGES');
        if (yield == 0 && avg != 0) revert('NO_YIELD');

        User storage user = users[msg.sender];
        uint remainder = block.timestamp.sub(avg) % YIELD_INTERVAL;
        user.likedTimestamps = uint224(user.likedCount * (block.timestamp - remainder));
        likeToken.mint(msg.sender, yield);
    }

    function _updateTopImages(uint _imageId) private 
    {
        if (topImages.length < 10) {
            topImages.push(_imageId);
        } else {
            uint likes = images[_imageId].likes;
            if (likes >= topImagesMinimum) {
                uint min = images[topImages[0]].likes;
                uint minIndex;
                for (uint i = 1; i < topImages.length; i++) {
                    uint currentLikes = images[topImages[i]].likes;
                    if (currentLikes < min) {
                        min = currentLikes;
                        minIndex = i;
                    }
                }
                topImages[minIndex] = _imageId;
                topImagesMinimum = min;
            }
        }
    }

    function _updateRecentlyLiked(uint _imageId) private 
    {
        if (recentlyLiked.length < 10) {
            recentlyLiked.push(_imageId);
        } else {
            recentlyLiked[currentRecentlyLiked] = _imageId;
            currentRecentlyLiked++;
            if (currentRecentlyLiked > 9) {
                currentRecentlyLiked = 0;
            }
        }
    }

    function calculateYield(address _user, uint _timestamp) public view returns(uint, uint) 
    {
        User storage user = users[_user];
        if (user.likedCount > 0) {
            if (_timestamp == 0) _timestamp = block.timestamp;
            uint avg = uint(user.likedTimestamps).div(user.likedCount);
            uint intervalCount = _timestamp.sub(avg).div(YIELD_INTERVAL);
            uint yield = YIELD_VALUE * intervalCount * user.likedCount;
            return (yield, avg);
        } else {
            return (0, 0);
        }
    }

    function getTopImages() public view returns(Image[] memory, bool[] memory, uint[] memory) 
    {
        return getImages(topImages);
    }

    function getRecentlyLiked() public view returns(Image[] memory, bool[] memory, uint[] memory)
    {
        return getImages(recentlyLiked);
    }

    function getUserImages(address _user) public view returns(Image[] memory, bool[] memory, uint[] memory) 
    {
        return getImages(users[_user].images);
    }

    function getImages(uint[] memory ids) public view returns(Image[] memory, bool[] memory, uint[] memory)
    {
        Image[] memory imgs = new Image[](ids.length);
        bool[] memory isLiked = new bool[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            imgs[i] = images[ids[i]];
            isLiked[i] = users[msg.sender].liked[ids[i]];
        }
        return (imgs, isLiked, ids);
    }
}