const cloudinary = require('../core/cloudinary');

const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'uploads', ...options },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(buffer);
    });
};

module.exports = uploadToCloudinary;
