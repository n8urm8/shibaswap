/**
 *Submitted for verification at BscScan.com on 2021-05-25
*/

// SPDX-License-Identifier: MIT

pragma solidity >=0.6.2;

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b > 0);
        // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        assert(a == b * c + a % b);
        // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract Ownable {
    address payable owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address payable newOwner) onlyOwner public {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}


interface BUSDToken {
    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function balanceOf(address _owner) external returns (uint256 balance);
    
    function approve(address spender, uint value) external returns (bool);

}

interface NovaToken {
    function transfer(address recipient, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function balanceOf(address _owner) external returns (uint256 balance);
}

contract Whitelisted is Ownable {
    mapping(address => uint8) public whitelist;
    mapping(address => bool) public provider;

    // Only whitelisted
    modifier onlyWhitelisted {
        require(isWhitelisted(msg.sender));
        _;
    }

    modifier onlyProvider {
        require(isProvider(msg.sender));
        _;
    }

    function isProvider(address _provider) public view returns (bool){
        return provider[_provider] == true ? true : false;
    }
    // Set new provider
    function setProvider(address _provider) public onlyOwner {
        provider[_provider] = true;
    }
    // Deactivate current provider
    function deactivateProvider(address _provider) public onlyOwner {
        require(provider[_provider] == true);
        provider[_provider] = false;
    }
    // Set purchaser to whitelist with zone code
    function joinWhitelist(address _purchaser, uint8 _zone) public onlyOwner{
        whitelist[_purchaser] = _zone;
    }
    // Delete purchaser from whitelist
    function deleteFromWhitelist(address _purchaser) public onlyOwner {
        whitelist[_purchaser] = 0;
    }
   
    // Check if purchaser is whitelisted : return true or false
    function isWhitelisted(address _purchaser) public view returns (bool){
        return whitelist[_purchaser] > 0;
    }
}

contract NovaSwap is Ownable, Whitelisted {
    using SafeMath for uint256;

    event Swap(address indexed user, uint256 inAmount, uint256 outAmount);

    BUSDToken public token0;
    NovaToken public token1;

    bool public isSwapStarted = false;

      //Will set to 980 when 1 Nova = $1, set to 1960 when 1 Nova = $2
    uint256 public swapRate = 980;

    uint256 public MIN_SWAP_RATE = 980;

    uint256 public MAX_SWAP_RATE = 1960;
    
    uint256 public maxBuy = 400000000000000000000; //408163270000000000000
  
    constructor(
        address payable _owner,
        BUSDToken _BUSDToken,
        NovaToken _novaToken
    ) public {
        token0 = _BUSDToken;
        token1 = _novaToken;
        owner = _owner;
        
    }
 

    function swap(uint256 inAmount) public onlyWhitelisted{
        uint256 quota = token1.balanceOf(address(this));
        uint256 total = token0.balanceOf(msg.sender);
        uint256 outAmount = inAmount.mul(1000).div(swapRate);
    

        require(isSwapStarted == true, 'ShibanovaSwap::Swap not started');
        require(inAmount <= total, "ShibanovaSwap::Insufficient funds");
        require(outAmount <= quota, "ShibanovaSwap::Quota not enough");
        require(token1.balanceOf(msg.sender).add(outAmount).div(980).mul(1000) <= maxBuy, "ShibanovaSwap: :Reached Max Buy");

        token0.transferFrom(msg.sender, address(this), inAmount);
        token1.transfer(msg.sender, outAmount);

        emit Swap(msg.sender, inAmount, outAmount);
    }

    function startSwap() public onlyOwner returns (bool) {
        isSwapStarted = true;
        return true;
    }

    function stopSwap() public onlyOwner returns (bool) {
        isSwapStarted = false;
        return true;
    }

    function setSwapRate(uint256 newRate) public onlyOwner returns (bool) {
        require(newRate <= MAX_SWAP_RATE, 'ShibanovaSwap::MAX_SWAP_RATE 980');
        require(newRate >= MIN_SWAP_RATE, 'ShibanovaSwap::MIN_SWAP_RATE 490');

        swapRate = newRate;
        return true;
    }

   function recoverLostBNB() public onlyOwner {
        address payable _owner = msg.sender;
        _owner.transfer(address(this).balance);
    }

    // Ensure requested tokens aren't users SHIBANOVA tokens
    function WithdrawBUSD(address _token, uint256 amount) public onlyOwner {
        BUSDToken(_token).transfer(msg.sender, amount);
    }

    function WithdrawNova(address _token, uint256 amount) public onlyOwner {
        NovaToken(_token).transfer(msg.sender, amount);
    }
}