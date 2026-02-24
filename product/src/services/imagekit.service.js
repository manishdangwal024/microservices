require("dotenv").config();
const ImageKit = require("@imagekit/nodejs");
const { v4: uuidv4 } = require("uuid");
const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
});
async function uploadImage({ buffer, folder = "/products" }) {
  const response = await client.files.upload({
    file: buffer.toString("base64"),
    fileName: uuidv4(),
    folder: folder,
  });
  return {
    url: response.url,
    thumbnail: response.thumbnailUrl || response.url,
    id: response.fileId,
  };
}

module.exports = uploadImage;
