// QR Code utility functions
export const generateTicketQRData = (booking, ticketNumber) => {
  // Create a URL that leads to the ticket verification page
  const baseUrl = window.location.origin;
  const verificationUrl = `${baseUrl}/ticket-verify/${booking._id}/${ticketNumber}`;
  
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