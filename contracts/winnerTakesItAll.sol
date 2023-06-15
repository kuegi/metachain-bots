// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

error NotEnoughValue();
error CantClaimEarly();
error WrongClaimer();

contract WinnerTakesItAll {

    address public lastInput;
    uint256 public balance;
    uint256 public nextMinAmount;
    uint public lastInputBlock;
    
    uint256 constant AMOUNT_INCREASE = 1e7;
    uint public WAIT_TIME_BLOCKS= 120;

    address burnAddress= address(0x0);

    constructor() {
        _reset();
    }

    function gamble() external payable {
        if(msg.value < nextMinAmount) {
            revert NotEnoughValue();
        }
        balance += msg.value;
        nextMinAmount += AMOUNT_INCREASE;
        lastInput = msg.sender;
        lastInputBlock = block.number;
    }

    function claim() external {
        if(lastInputBlock > block.number - WAIT_TIME_BLOCKS) {
            revert CantClaimEarly();
        }
        if(msg.sender != lastInput) {
            revert WrongClaimer();
        }
        uint256 burn= balance/2;
        uint256 profit= balance - burn;
        (bool result, ) = burnAddress.call{value: burn}("");
        require(result,"Failed to burn");
        ( result, ) = msg.sender.call{value: profit}("");
        require(result,"Failed to send win");
        _reset();
    }

    // --- internals

    function _reset() internal {
        nextMinAmount= AMOUNT_INCREASE;
        balance= 0;
        lastInput= address(0x0);
    }

}
