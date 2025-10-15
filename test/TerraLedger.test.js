const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TerraLedger", function () {
    async function deployTerraLedgerFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const TerraLedger = await ethers.getContractFactory("TerraLedger");
        const terraLedger = await TerraLedger.deploy();
        return { terraLedger, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { terraLedger, owner } = await deployTerraLedgerFixture();
            expect(await terraLedger.owner()).to.equal(owner.address);
        });
    });

    // START OF NEW TESTS
    describe("Property Registration", function () {
        it("Should allow the owner to register a new property", async function () {
            const { terraLedger, owner, otherAccount } = await deployTerraLedgerFixture();
            const propertyLocation = "123 Main St, Anytown";
            const newOwnerAddress = otherAccount.address;

            // Register the property
            await terraLedger.connect(owner).registerProperty(newOwnerAddress, propertyLocation);

            // Check the details of the newly registered property
            const property = await terraLedger.properties(1);
            expect(property.propertyId).to.equal(1);
            expect(property.owner).to.equal(newOwnerAddress);
            expect(property.location).to.equal(propertyLocation);
            expect(property.isRegistered).to.be.true;

            // Check that the ID counter has incremented
            expect(await terraLedger.nextPropertyId()).to.equal(2);
        });

        it("Should fail if a non-owner tries to register a property", async function () {
            const { terraLedger, otherAccount } = await deployTerraLedgerFixture();

            // Expect the transaction to be reverted with the specific error message
            await expect(
                terraLedger.connect(otherAccount).registerProperty(otherAccount.address, "456 Side St")
            ).to.be.revertedWith("Only the contract owner can register new properties");
        });
    });
    // END OF NEW TESTS
});