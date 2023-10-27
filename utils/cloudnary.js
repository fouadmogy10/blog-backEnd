const cloudinary = require('cloudinary');
// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDNARY_Cloud_Name,
    api_key: process.env.CLOUDNARY_API_Key,
    api_secret: process.env.CLOUDNARY_API_Secret
});

// Upload
const CloudUploadImage = async (fileUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileUpload, { resource_type: "auto" });
        return data
    } catch (error) {
        throw new Error("internal server Error (Cloudinary)")
    }
}
// remove
const CloudRemoveImage = async (fileUpload) => {
    try {
        const data = await cloudinary.v2.uploader.destroy(fileUpload);
        return data
    } catch (error) {
        throw new Error("internal server Error (Cloudinary)")
    }
}
// remove meny
const CloudRemoveMultiImage = async (publicId) => {
    try {
        const data = await cloudinary.v2.api.delete_resources(publicId);
        return data
    } catch (error) {
        throw new Error("internal server Error (Cloudinary)")
    }
}



module.exports = {
    CloudUploadImage,
    CloudRemoveImage,
    CloudRemoveMultiImage
}

