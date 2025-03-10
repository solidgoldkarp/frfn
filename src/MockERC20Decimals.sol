// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20Decimals is ERC20 {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens to the specified address.
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance. Caller must have allowance for ``account``'s tokens of at least
     * `amount`.
     * @param account The address whose tokens will be burnt
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");

        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}