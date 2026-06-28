require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { connectCloudinary, cloudinary } = require('./config/cloudinary');
const streamifier = require('streamifier');

connectCloudinary();

const uploadTest = async () => {
  try {
    const buffer = Buffer.from('test audio content');
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'message_audio' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error);
          process.exit(1);
        }
        console.log('Cloudinary Success:', result);
        process.exit(0);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  } catch (err) {
    console.error('Catch Error:', err);
    process.exit(1);
  }
};

uploadTest();
