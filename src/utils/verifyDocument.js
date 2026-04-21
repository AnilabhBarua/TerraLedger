import CryptoJS from 'crypto-js';

/**
 * Reads a File object and returns its content as a CryptoJS WordArray.
 * @param {File} file
 * @returns {Promise<CryptoJS.lib.WordArray>}
 */
function readFileAsWordArray(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      resolve(wordArray);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Computes the SHA-256 hash of a file.
 * @param {File} file - The file to hash.
 * @returns {Promise<string>} The SHA-256 hex digest of the file.
 */
export async function hashFile(file) {
  const wordArray = await readFileAsWordArray(file);
  const hash = CryptoJS.SHA256(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}

/**
 * Verifies a document against an on-chain IPFS CID by fetching the
 * original file from IPFS and comparing SHA-256 hashes.
 *
 * Strategy: Since IPFS CIDs are content-addressed, a matching CID
 * guarantees authenticity. We fetch the original from IPFS, hash both
 * the fetched content and the uploaded file, and compare.
 *
 * @param {File} file - The local file the user wants to verify.
 * @param {string} ipfsCid - The CID stored on the blockchain.
 * @returns {Promise<{isMatch: boolean, localHash: string, status: string}>}
 */
export async function verifyDocumentAgainstChain(file, ipfsCid) {
  // Step 1: Hash the local file the user uploaded
  const localHash = await hashFile(file);

  // Step 2: Fetch the original document from IPFS
  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
  let ipfsHash;

  try {
    const response = await fetch(ipfsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS gateway: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    ipfsHash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
  } catch (err) {
    throw new Error(`Could not retrieve document from IPFS: ${err.message}`);
  }

  // Step 3: Compare the two hashes
  const isMatch = localHash === ipfsHash;

  return {
    isMatch,
    localHash,
    ipfsHash,
    status: isMatch ? 'AUTHENTIC' : 'TAMPERED',
  };
}
