// QR Code utility functions
export const generateTicketQRData = (booking, ticketNumber) => {
  // Generate a verification URL
  const baseUrl = window.location.origin;
  const verificationUrl = `${baseUrl}/verify-ticket/${booking._id}/${ticketNumber}`;
  
  // Return the verification URL directly - this makes the QR code scannable and directs to the verification page
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