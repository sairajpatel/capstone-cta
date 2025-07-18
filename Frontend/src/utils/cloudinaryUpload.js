/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string of the file
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
    fileReader.readAsDataURL(file);
  });
};

/**
 * Validates and processes an image file for upload
 * @param {File} file - The image file to process
 * @returns {Promise<{base64: string, error: string|null}>}
 */
export const processImageUpload = async (file) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { base64: null, error: 'Please upload an image file' };
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return { base64: null, error: 'Image size should be less than 5MB' };
    }

    // Convert to base64
    const base64 = await convertToBase64(file);
    console.log('File converted to base64 successfully');
    return { base64, error: null };
  } catch (error) {
    console.error('Error processing image:', error);
    return { base64: null, error: 'Error processing image. Please try again.' };
  }
}; 