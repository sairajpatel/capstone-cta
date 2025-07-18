import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { processImageUpload } from '../../../utils/cloudinaryUpload';
import axios from '../../../utils/axios';
import toast from 'react-hot-toast';

const BannerUpload = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Process and validate the image
      const { base64, error } = await processImageUpload(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Set preview and store the base64 for upload
      setPreviewImage(base64);
      setSelectedFile(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(`/events/${eventId}/banner`, {
        bannerImage: selectedFile
      });

      if (response.data.success) {
        toast.success('Banner uploaded successfully!');
        // Navigate to ticketing step
        navigate(`/organizer/create-event/ticketing/${eventId}`);
      } else {
        throw new Error(response.data.message || 'Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error(error.response?.data?.message || 'Error uploading banner');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/organizer/create-event/ticketing/${eventId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Upload Event Banner</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Event Banner Image
            </label>
            
            {/* Image Upload Area */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
              <div className="space-y-1 text-center">
                <div className="flex flex-col items-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-64 w-auto object-contain mb-4"
                    />
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="profile-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#28264D] hover:text-[#1a1936] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#28264D]"
                    >
                      <span>Upload a file</span>
                      <input
                        id="profile-image"
                        name="profile-image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                        disabled={loading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              
              {/* Make entire area clickable */}
              <label
                htmlFor="profile-image"
                className="absolute inset-0 cursor-pointer"
              ></label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28264D]"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-[#28264D] rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28264D] disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerUpload; 