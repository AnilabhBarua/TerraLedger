import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TerraLedger", function () {
  async function deployFixture() {
    const [deployer, authority, registrar, propertyOwner, buyer, stranger] =
      await ethers.getSigners();
    const TerraLedger = await ethers.getContractFactory("TerraLedger");
    const contract = await TerraLedger.deploy();

    const AUTHORITY_ROLE = await contract.AUTHORITY_ROLE();
    const REGISTRAR_ROLE = await contract.REGISTRAR_ROLE();

    return {
      contract,
      deployer,
      authority,
      registrar,
      propertyOwner,
      buyer,
      stranger,
      AUTHORITY_ROLE,
      REGISTRAR_ROLE,
    };
  }

  // Helper: register a property with sensible defaults
  async function registerProperty(
    contract,
    signer,
    ownerAddr,
    overrides = {}
  ) {
    const defaults = {
      location: "123 Main Street, City, Country",
      area: "1500 sq ft",
      type: "Residential",
      hash: "QmTestHashABC",
    };
    const opts = { ...defaults, ...overrides };
    return contract
      .connect(signer)
      .registerProperty(ownerAddr, opts.location, opts.area, opts.type, opts.hash);
  }

  // ─────────────────────────── DEPLOYMENT ───────────────────────────
  describe("Deployment", function () {
    it("grants deployer DEFAULT_ADMIN_ROLE, AUTHORITY_ROLE and REGISTRAR_ROLE", async function () {
      const { contract, deployer, AUTHORITY_ROLE, REGISTRAR_ROLE } =
        await deployFixture();
      const DEFAULT_ADMIN = await contract.DEFAULT_ADMIN_ROLE();
      expect(await contract.hasRole(DEFAULT_ADMIN, deployer.address)).to.be.true;
      expect(await contract.hasRole(AUTHORITY_ROLE, deployer.address)).to.be.true;
      expect(await contract.hasRole(REGISTRAR_ROLE, deployer.address)).to.be.true;
    });

    it("starts nextPropertyId at 1", async function () {
      const { contract } = await deployFixture();
      expect(await contract.nextPropertyId()).to.equal(1);
    });
  });

  // ──────────────────────── ROLE MANAGEMENT ────────────────────────
  describe("Role Management", function () {
    it("Authority can add a registrar via addRegistrar", async function () {
      const { contract, deployer, registrar, REGISTRAR_ROLE } =
        await deployFixture();
      await contract.connect(deployer).addRegistrar(registrar.address);
      expect(await contract.hasRole(REGISTRAR_ROLE, registrar.address)).to.be.true;
    });

    it("Authority can remove a registrar via removeRegistrar", async function () {
      const { contract, deployer, registrar, REGISTRAR_ROLE } =
        await deployFixture();
      await contract.connect(deployer).addRegistrar(registrar.address);
      await contract.connect(deployer).removeRegistrar(registrar.address);
      expect(await contract.hasRole(REGISTRAR_ROLE, registrar.address)).to.be.false;
    });

    it("Non-authority cannot add a registrar", async function () {
      const { contract, stranger, registrar } = await deployFixture();
      await expect(
        contract.connect(stranger).addRegistrar(registrar.address)
      ).to.be.reverted;
    });

    it("_setRoleAdmin: AUTHORITY_ROLE is admin of REGISTRAR_ROLE", async function () {
      const { contract, AUTHORITY_ROLE, REGISTRAR_ROLE } = await deployFixture();
      const admin = await contract.getRoleAdmin(REGISTRAR_ROLE);
      expect(admin).to.equal(AUTHORITY_ROLE);
    });
  });

  // ───────────────────── PROPERTY REGISTRATION ─────────────────────
  describe("Property Registration", function () {
    it("Registrar can register a property with 5 arguments", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      const prop = await contract.properties(1);
      expect(prop.owner).to.equal(propertyOwner.address);
      expect(prop.location).to.equal("123 Main Street, City, Country");
      expect(prop.area).to.equal("1500 sq ft");
      expect(prop.propertyType).to.equal("Residential");
      expect(prop.documentHash).to.equal("QmTestHashABC");
      expect(prop.isRegistered).to.be.true;
    });

    it("nextPropertyId increments after registration", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      expect(await contract.nextPropertyId()).to.equal(2);
    });

    it("Non-registrar cannot register a property", async function () {
      const { contract, stranger, propertyOwner } = await deployFixture();
      await expect(
        registerProperty(contract, stranger, propertyOwner.address)
      ).to.be.reverted;
    });

    it("Reverts on zero owner address", async function () {
      const { contract, deployer } = await deployFixture();
      await expect(
        contract
          .connect(deployer)
          .registerProperty(
            ethers.ZeroAddress,
            "Some Location",
            "100 sq ft",
            "Residential",
            "QmHash"
          )
      ).to.be.revertedWith("Invalid owner address.");
    });

    it("Reverts on empty location", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await expect(
        contract
          .connect(deployer)
          .registerProperty(
            propertyOwner.address,
            "",
            "100 sq ft",
            "Residential",
            "QmHash"
          )
      ).to.be.revertedWith("Location cannot be empty.");
    });

    it("Reverts on empty area", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await expect(
        contract
          .connect(deployer)
          .registerProperty(
            propertyOwner.address,
            "Some Location",
            "",
            "Residential",
            "QmHash"
          )
      ).to.be.revertedWith("Area cannot be empty.");
    });

    it("Emits PropertyRegistered event", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await expect(
        registerProperty(contract, deployer, propertyOwner.address)
      )
        .to.emit(contract, "PropertyRegistered")
        .withArgs(
          1,
          propertyOwner.address,
          "123 Main Street, City, Country",
          "1500 sq ft",
          "Residential",
          "QmTestHashABC"
        );
    });
  });

  // ─────────────────── TRANSFER: REQUEST → APPROVE ─────────────────
  describe("Ownership Transfer Flow", function () {
    it("Property owner can request a transfer", async function () {
      const { contract, deployer, propertyOwner, buyer } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(propertyOwner).requestTransfer(1, buyer.address)
      )
        .to.emit(contract, "TransferRequested")
        .withArgs(1, propertyOwner.address, buyer.address);

      const req = await contract.transferRequests(1);
      expect(req.buyer).to.equal(buyer.address);
      expect(req.pending).to.be.true;
    });

    it("Non-owner cannot request a transfer", async function () {
      const { contract, deployer, propertyOwner, buyer, stranger } =
        await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(stranger).requestTransfer(1, buyer.address)
      ).to.be.revertedWith("You are not the owner of this property.");
    });

    it("Cannot transfer to zero address", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(propertyOwner).requestTransfer(1, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid buyer address.");
    });

    it("Cannot transfer to self", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(propertyOwner).requestTransfer(1, propertyOwner.address)
      ).to.be.revertedWith("Cannot transfer to self.");
    });

    it("Registrar can approve transfer, changes ownership, cleans storage", async function () {
      const { contract, deployer, propertyOwner, buyer } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await contract.connect(propertyOwner).requestTransfer(1, buyer.address);

      await expect(contract.connect(deployer).approveTransfer(1))
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(1, propertyOwner.address, buyer.address)
        .and.to.emit(contract, "TransferApproved")
        .withArgs(1, propertyOwner.address, buyer.address);

      const prop = await contract.properties(1);
      expect(prop.owner).to.equal(buyer.address);

      // storage should be cleaned (pending = false, buyer = zero)
      const req = await contract.transferRequests(1);
      expect(req.pending).to.be.false;
      expect(req.buyer).to.equal(ethers.ZeroAddress);
    });

    it("Non-registrar cannot approve transfer", async function () {
      const { contract, deployer, propertyOwner, buyer, stranger } =
        await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await contract.connect(propertyOwner).requestTransfer(1, buyer.address);
      await expect(
        contract.connect(stranger).approveTransfer(1)
      ).to.be.reverted;
    });

    it("Approving non-existent transfer request reverts", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(deployer).approveTransfer(1)
      ).to.be.revertedWith("No pending transfer request.");
    });
  });

  // ──────────────────────── CANCEL TRANSFER ────────────────────────
  describe("Cancel Transfer", function () {
    it("Owner can cancel a pending transfer", async function () {
      const { contract, deployer, propertyOwner, buyer } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await contract.connect(propertyOwner).requestTransfer(1, buyer.address);

      await expect(contract.connect(propertyOwner).cancelTransfer(1))
        .to.emit(contract, "TransferCancelled")
        .withArgs(1, propertyOwner.address);

      const req = await contract.transferRequests(1);
      expect(req.pending).to.be.false;
      expect(req.buyer).to.equal(ethers.ZeroAddress);
    });

    it("Registrar can also cancel a pending transfer", async function () {
      const { contract, deployer, propertyOwner, buyer } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await contract.connect(propertyOwner).requestTransfer(1, buyer.address);
      await expect(
        contract.connect(deployer).cancelTransfer(1)
      ).to.emit(contract, "TransferCancelled");
    });

    it("Stranger cannot cancel a transfer", async function () {
      const { contract, deployer, propertyOwner, buyer, stranger } =
        await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await contract.connect(propertyOwner).requestTransfer(1, buyer.address);
      await expect(
        contract.connect(stranger).cancelTransfer(1)
      ).to.be.revertedWith("Not owner or registrar.");
    });
  });

  // ─────────────────── UPDATE PROPERTY DOCUMENT ────────────────────
  describe("Update Property Document", function () {
    it("Registrar can update the document hash", async function () {
      const { contract, deployer, propertyOwner } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);

      const newCid = "QmNewDocumentCID";
      await expect(
        contract.connect(deployer).updatePropertyDocument(1, newCid)
      )
        .to.emit(contract, "PropertyDocumentUpdated")
        .withArgs(1, deployer.address, newCid);

      const prop = await contract.properties(1);
      expect(prop.documentHash).to.equal(newCid);
    });

    it("Non-registrar cannot update the document hash", async function () {
      const { contract, deployer, propertyOwner, stranger } = await deployFixture();
      await registerProperty(contract, deployer, propertyOwner.address);
      await expect(
        contract.connect(stranger).updatePropertyDocument(1, "QmNewHash")
      ).to.be.reverted;
    });

    it("Cannot update document for non-existent property", async function () {
      const { contract, deployer } = await deployFixture();
      await expect(
        contract.connect(deployer).updatePropertyDocument(99, "QmNewHash")
      ).to.be.revertedWith("Property does not exist.");
    });
  });
});