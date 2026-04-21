const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Uploads a file to IPFS via the Pinata API.
 * @param {File} file - The file object from an <input type="file"> element.
 * @returns {Promise<{ipfsHash: string, ipfsUrl: string}>} The IPFS CID and gateway URL.
 */
export async function uploadToPinata(file) {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured. Check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `TerraLedger_${file.name}_${Date.now()}`,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = typeof errorData.error === 'object' 
      ? JSON.stringify(errorData.error) 
      : (errorData.error || response.statusText);
    throw new Error(`Pinata upload failed: ${message}`);
  }

  const data = await response.json();

  return {
    ipfsHash: data.IpfsHash,
    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}
