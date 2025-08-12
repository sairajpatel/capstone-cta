# 🎉 GatherGuru - Event Management Platform

![GatherGuru](https://img.shields.io/badge/GatherGuru-Event%20Management-blue)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![Stripe](https://img.shields.io/badge/Payment-Stripe-purple)

GatherGuru is a comprehensive event management platform that connects event organizers with attendees. The platform provides tools for creating, managing, and discovering events with integrated payment processing and ticket management.

## 🌟 Features

### 👥 Multi-Role System
- **Users**: Discover events, book tickets, manage bookings
- **Organizers**: Create and manage events, track analytics
- **Admins**: Platform administration, user management, analytics

### 🎫 Event Management
- **Event Creation**: Step-by-step event creation wizard
- **16 Event Categories**: Musical concerts, weddings, corporate events, workshops, and more
- **Ticket Types**: Free and paid events with multiple ticket tiers
- **Banner Upload**: Cloudinary integration for event images
- **Event Discovery**: Browse and search events by category, location, and date

### 💳 Payment & Booking
- **Stripe Integration**: Secure payment processing
- **QR Code Tickets**: Digital ticket generation with QR codes
- **Booking Management**: Track and manage event bookings
- **Payment Analytics**: Revenue tracking and reporting

### 📊 Analytics & Insights
- **Event Analytics**: Attendance tracking and revenue reports
- **User Analytics**: Profile views and engagement metrics
- **Ticket Analytics**: Sales performance and trends
- **Visual Charts**: Interactive charts using Recharts and Nivo

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Material-UI Components**: Professional UI components
- **Framer Motion**: Smooth animations and transitions
- **Dark/Light Theme**: User preference theming
- **SEO Optimized**: Comprehensive SEO implementation

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.0 with Vite
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **Animation**: Framer Motion
- **Charts**: Recharts, Chart.js, Nivo
- **HTTP Client**: Axios
- **Routing**: React Router Dom
- **Notifications**: React Hot Toast
- **Payment**: Stripe React Components
- **QR Codes**: qrcode.react
- **SEO**: React Helmet Async

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer with Cloudinary
- **Payment**: Stripe API
- **Security**: CORS, Cookie Parser
- **Development**: Nodemon

### DevOps & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Vercel
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary for images
- **Domain**: gatherguru.ca

## 📁 Project Structure

```
capstone-cta/
├── Frontend/                    # React frontend application
│   ├── src/
│   │   ├── Componets/          # React components
│   │   │   ├── User/           # User-related components
│   │   │   ├── Organizer/      # Organizer-related components
│   │   │   ├── Admin/          # Admin-related components
│   │   │   └── SEO/            # SEO components
│   │   ├── pages/              # Page components
│   │   ├── redux/              # State management
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration files
│   │   └── assets/             # Static assets
│   ├── public/                 # Public static files
│   └── dist/                   # Build output
├── Backend/                     # Node.js backend application
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── config/                 # Configuration files
│   └── uploads/                # File uploads directory
└── Documentation/              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gatherguru.git
   cd gatherguru
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/categories` - Get event categories

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/event/:eventId` - Get event bookings

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/events` - Get all events
- `GET /api/admin/analytics` - Get platform analytics

## 🎯 Key Features in Detail

### Event Creation Workflow
1. **Basic Details**: Title, category, date, time, location, description
2. **Banner Upload**: Event image upload with Cloudinary
3. **Ticketing**: Configure ticket types, pricing, and availability
4. **Review & Publish**: Final review and event publication

### User Journey
1. **Discovery**: Browse events by category, search, and filters
2. **Event Details**: View comprehensive event information
3. **Booking**: Select tickets and proceed to payment
4. **Payment**: Secure Stripe payment processing
5. **Tickets**: Receive QR code tickets for event entry

### Analytics Dashboard
- **Revenue Tracking**: Monitor ticket sales and revenue
- **Attendance Analytics**: Track event popularity and attendance
- **User Engagement**: Monitor user activity and preferences
- **Visual Reports**: Interactive charts and graphs

## 🔧 Development

### Build for Production

#### Frontend
```bash
cd Frontend
npm run build
```

#### Backend
```bash
cd Backend
npm start
```

### Linting
```bash
# Frontend
cd Frontend
npm run lint

# Backend uses ES6+ standards
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Vercel)
1. Configure `vercel.json` for serverless deployment
2. Set environment variables
3. Deploy backend API

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access and database users
3. Use connection string in environment variables

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Cloudinary integration with file type validation

## 📱 Mobile Responsiveness

The platform is fully responsive and optimized for:
- **Desktop**: Full feature set with advanced UI
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with essential features

## 🎨 SEO & Performance

- **SEO Optimized**: Meta tags, structured data, sitemap
- **Performance**: Lazy loading, code splitting, optimized images
- **PWA Ready**: Manifest file and service worker support
- **Social Sharing**: Open Graph and Twitter Card meta tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Material-UI for the component library
- Stripe for payment processing
- Cloudinary for image management
- MongoDB for the database solution
- Vercel for hosting platform

## 📞 Support

For support, email support@gatherguru.ca or create an issue in this repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**