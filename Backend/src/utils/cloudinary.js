import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
// import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//console.log("Cloudinary Config:", cloudinary.config());

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    //file has been uploaded successfully
    //console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath)
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operation got failed
    return null
  }
}
// const uploadOnCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { resource_type: "auto" },
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// };
export { uploadOnCloudinary }