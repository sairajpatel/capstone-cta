// QR Code utility functions
export const generateTicketQRData = (booking, ticketNumber) => {
  // Create a professional, readable text format for QR code scanning
  const ticketInfo = `
Event: ${booking.event.title}
Date: ${new Date(booking.event.startDate).toLocaleDateString()}
Time: ${booking.event.startTime || 'TBA'}
Location: ${booking.event.location}
------------------
Ticket Type: ${booking.ticketType}
Ticket #: ${ticketNumber}
Status: Confirmed
------------------
This ticket is non-transferable.
Powered by GatherGuru
`;
  
  return ticketInfo.trim();
};

export const parseTicketQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
}; 