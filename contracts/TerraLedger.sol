// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TerraLedger
 * @dev A smart contract for a decentralized land registry.
 */
contract TerraLedger is AccessControl {

    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Property {
        uint256 propertyId;
        address owner;
        string location;
        string area;
        string propertyType;
        string documentHash;
        bool isRegistered;
    }

    struct TransferRequest {
        address buyer;
        bool pending;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => TransferRequest) public transferRequests;
    uint256 public nextPropertyId = 1;


    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed owner,
        string location,
        string area,
        string propertyType,
        string documentHash
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed oldOwner,
        address indexed newOwner
    );

    event TransferRequested(
        uint256 indexed propertyId,
        address indexed owner,
        address indexed buyer
    );

    event TransferApproved(
        uint256 indexed propertyId,
        address indexed owner,
        address indexed buyer
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function addRegistrar(address account) external onlyRole(AUTHORITY_ROLE) {
        grantRole(REGISTRAR_ROLE, account);
    }

    function removeRegistrar(address account) external onlyRole(AUTHORITY_ROLE) {
        revokeRole(REGISTRAR_ROLE, account);
    }

    function registerProperty(
        address _propertyOwner, 
        string memory _location, 
        string memory _area, 
        string memory _propertyType,
        string memory _documentHash
    ) external onlyRole(REGISTRAR_ROLE) {
        uint256 newPropertyId = nextPropertyId;
        properties[newPropertyId] = Property(
            newPropertyId,
            _propertyOwner,
            _location,
            _area,
            _propertyType,
            _documentHash,
            true
        );

        emit PropertyRegistered(
            newPropertyId,
            _propertyOwner,
            _location,
            _area,
            _propertyType,
            _documentHash
        );

        nextPropertyId++;
    }

    
    /**
     * @dev Allows the current owner to request a transfer to a new buyer.
     * @param _propertyId The ID of the property.
     * @param _buyer The address of the new owner/buyer.
     */
    function requestTransfer(uint256 _propertyId, address _buyer) external {
        Property storage property = properties[_propertyId];
        require(property.isRegistered, "Property does not exist.");
        require(msg.sender == property.owner, "You are not the owner of this property.");
        require(_buyer != address(0), "Invalid buyer address.");
        require(_buyer != property.owner, "Cannot transfer to self.");

        transferRequests[_propertyId] = TransferRequest({
            buyer: _buyer,
            pending: true
        });

        emit TransferRequested(_propertyId, msg.sender, _buyer);
    }

    /**
     * @dev Allows a registrar to approve a pending transfer request.
     * @param _propertyId The ID of the property.
     */
    function approveTransfer(uint256 _propertyId) external onlyRole(REGISTRAR_ROLE) {
        TransferRequest storage request = transferRequests[_propertyId];
        require(request.pending, "No pending transfer request.");
        
        Property storage property = properties[_propertyId];
        address oldOwner = property.owner;
        address newOwner = request.buyer;

        property.owner = newOwner;
        request.pending = false;

        emit TransferApproved(_propertyId, oldOwner, newOwner);
        emit OwnershipTransferred(_propertyId, oldOwner, newOwner);
    }

    /**
     * @dev Allows the owner or a registrar to cancel a pending transfer testtt.
     * @param _propertyId The ID of the property.
     */
    function cancelTransfer(uint256 _propertyId) external {
        Property storage property = properties[_propertyId];
        require(msg.sender == property.owner || hasRole(REGISTRAR_ROLE, msg.sender), "Not owner or registrar.");
        require(transferRequests[_propertyId].pending, "No pending transfer.");
        
        transferRequests[_propertyId].pending = false;
    }
    
}