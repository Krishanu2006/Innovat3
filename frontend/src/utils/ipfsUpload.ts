import axios from 'axios'

const JWT =  import.meta.env.VITE_PINATA_JWT// Store in .env later

export const uploadToIPFS = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        Authorization: `Bearer ${JWT}`
      }
    })
    return res.data.IpfsHash // This is the CID
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw error
  }
}