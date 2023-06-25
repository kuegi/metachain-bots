// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;


contract Oracle {
    address owner;
    mapping(string => uint256) prices;

    constructor() {
        owner = msg.sender;
    }

    struct OraclePrice {
        string symbol;
        uint256 price;
    }

    //encode parameter like this: [["0xaddressOfToken",1234],["0xaddressOfNextToken",5678]]
    function setOraclePrices(OraclePrice[] calldata _prices) external {
        require(msg.sender == owner, "Only owner can set prices");
        for (uint256 i = 0; i < _prices.length; i++) {
            OraclePrice calldata price = _prices[i];
            prices[price.symbol] = price.price;
        }
    }

    function getPrice(string calldata symbol) external view returns(uint256 price) {
      return prices[symbol];
    }
}
