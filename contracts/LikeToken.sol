// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract LikeToken is ERC20 {
    address public admin;
    
    constructor() ERC20('LikeToken', 'LIKE') 
    {
        admin = msg.sender;
        _mint(msg.sender, 10000 ether);
    }

    function setAdmin(address _admin) external onlyAdmin
    {
        admin = _admin;
    }

    function mint(address _receiver, uint _amount) external onlyAdmin
    {
        _mint(_receiver, _amount);
    }

    function burn(address _receiver, uint _amount) external onlyAdmin
    {
        _burn(_receiver, _amount);
    }

    modifier onlyAdmin()
    {
        require(msg.sender == admin, 'NO_ADMIN');
        _;
    }
}