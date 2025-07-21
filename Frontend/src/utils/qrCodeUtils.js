// QR Code utility functions
export const generateTicketQRData = (booking, ticketNumber) => {
  // Generate a URL that will direct to ticket verification page
  const baseUrl = window.location.origin;
  const verificationUrl = `${baseUrl}/verify-ticket/${booking._id}/${ticketNumber}`;
  
  // Return just the URL for cleaner QR codes
  return verificationUrl;
};

export const parseTicketQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
}; 