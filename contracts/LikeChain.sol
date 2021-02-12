// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import './LikeToken.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';

contract LikeChain
{
    using SafeMath for uint;

    uint constant YIELD_PERCENT = 1001000000; //1.001%
    uint constant YIELD_INTERVAL = 15 seconds;
    uint constant LIKE_VALUE = 1 ether;
    uint constant FEE = 10 ** 17;
    uint public imageId;

    LikeToken likeToken;
    mapping(address => User) public users;
    mapping(uint => Image) public images;
    uint[] public topImages;
    uint topImagesMinimum;

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
        images[imageId] = Image(msg.sender, _IPFShash, _description, new address[](0));
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
        users[msg.sender].likedTimestamps += block.timestamp;
        images[_imageId].likes.push(msg.sender);
        
        emit ImageLiked(_imageId, msg.sender);
        _updateTopImages(_imageId);
    }

    function _updateTopImages(uint _imageId) private 
    {
        if (topImages.length < 10) {
            topImages.push(_imageId);
        } else {
            uint likes = images[_imageId].likes.length;
            if (likes >= topImagesMinimum) {
                uint min = images[topImages[0]].likes.length;
                uint minIndex;
                for (uint i = 1; i < topImages.length; i++) {
                    uint currentLikes = images[topImages[i]].likes.length;
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
            uint intervalCount = block.timestamp.sub(avg).div(YIELD_INTERVAL);
            uint yield = 0;
            uint base = 1 ether;
            uint divisor = 10 ** 9;
            uint interval = 8;
            if (intervalCount > 0) {
                if (intervalCount >= 2) {
                    yield = base;
                    for (uint i = 0; i < intervalCount.div(interval); i++) {
                        yield *= (YIELD_PERCENT ** interval).div(divisor ** (interval - 2));
                        yield = yield.div(base);
                    }
                    uint remainder = intervalCount % interval;
                    if (remainder >= 2) {
                        yield *= (YIELD_PERCENT ** remainder).div(divisor ** (remainder - 2));
                    } else if (remainder == 1) {
                        yield *= YIELD_PERCENT ** remainder * divisor;
                    }
                    yield = yield.div(base);
                } else if (intervalCount == 1) {
                    yield = YIELD_PERCENT ** intervalCount * divisor;
                }
                yield *= user.likedCount;
                yield -= user.likedCount * base;
            }
            return (yield, intervalCount);
        } else {
            return (0, 0);
        }
    }
}