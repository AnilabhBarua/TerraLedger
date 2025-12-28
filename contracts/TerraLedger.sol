// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger {

    struct Property {
        uint256 propertyId;
        address owner;
        string location;
        string area;
        string propertyType;
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId = 1;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function registerProperty(
        address _propertyOwner, 
        string memory _location, 
        string memory _area, 
        string memory _propertyType
    ) external {
        require(msg.sender == owner, "Only the contract owner can register new properties");
        uint256 newPropertyId = nextPropertyId;
        properties[newPropertyId] = Property(
            newPropertyId,
            _propertyOwner,
            _location,
            _area,
            _propertyType,
            true
        );
        nextPropertyId++;
    }

    
    /**
     * @dev Allows the current owner of a property to transfer it to a new owner.
     * @param _propertyId The ID of the property to transfer.
     * @param _newOwner The address of the new owner.
     */
    function transferOwnership(uint256 _propertyId, address _newOwner) external {
        // Step 1: Create a reference to the property in storage.
        Property storage property = properties[_propertyId];

        // Step 2: Perform security checks.
        require(property.isRegistered, "Property does not exist.");
        require(msg.sender == property.owner, "You are not the owner of this property.");

        // Step 3: Update the owner.
        property.owner = _newOwner;
    }
    
}