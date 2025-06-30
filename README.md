# �� FreeMobNotifier

A modern, mobile-optimized web application for sending SMS notifications through the Free Mobile API with advanced scheduling capabilities.

## ✨ Features

- 📤 **Immediate SMS sending** with real-time feedback
- 🕒 **Advanced scheduling** with one-time and recurring messages
- 🔁 **Flexible recurrence options** (daily, weekly, monthly)
- 📋 **Separate dedicated views** for different message types
- 🔍 **Smart search and filtering** with pagination
- 📱 **Mobile-first responsive design** optimized for all devices
- ⚙️ **Secure credential management** with test functionality
- 🗄️ **Local file-based database** (no external database required)
- 🎨 **Modern card-based interface** with touch-friendly navigation
- ⏰ **Smart date formatting** and compact message display

## 🚀 Application Structure

FreeMobNotifier features a clean, intuitive interface with four main sections:

### 🏠 Accueil (Home)
Central hub for sending and scheduling messages with two tabs:

**📤 Envoyer maintenant (Send Now)**
- Compose and send SMS messages immediately
- Real-time character counter (160 chars max)
- Instant delivery feedback

**⏰ Programmer (Schedule)**
- Create scheduled messages with custom date/time picker
- **One-time messages**: Set specific date and time
- **Recurring options**:
  - **Daily**: Send every day at specified time
  - **Weekly**: Choose specific days of the week
  - **Monthly**: Select day of the month
- Visual recurrence configuration with toggle buttons

### 📜 Historique (Message History)
Dedicated view for **sent messages only**:
- Search functionality across message content
- Pagination for easy navigation
- Modern card-based display
- Expandable message content for long texts
- Smart date formatting for readability

### 🕐 Programmés (Scheduled Messages)
Separate management view for **pending/scheduled messages**:
- Filter by recurrence type (daily, weekly, monthly, one-time)
- Compact date display with contextual formatting
- Delete scheduled messages with confirmation
- Real-time status updates
- Enhanced dropdown filtering

### ⚙️ Paramètres (Settings)
Secure configuration management:
- Free Mobile API credentials setup
- Test SMS functionality
- Credential validation with feedback
- Secure storage of sensitive data

## 📱 Mobile Optimization

FreeMobNotifier is built with a **mobile-first approach**:

### 🎯 Touch-Friendly Design
- **44px minimum touch targets** for all interactive elements
- **Bottom navigation bar** for easy thumb access
- **16px font size** on form inputs (prevents iOS zoom)
- **Enhanced dropdowns** with improved styling
- **Swipe-friendly card layouts**

### 📐 Responsive Breakpoints
- **≤360px**: Very small mobile devices
- **361-480px**: Standard mobile phones
- **481-767px**: Large phones and small tablets
- **≥768px**: Tablets and desktop

### 🎨 Modern Interface
- **Card-based layouts** replacing traditional tables
- **Gradient headers** with visual status indicators
- **Smart spacing** optimized for different screen sizes
- **Professional typography** with consistent font weights
- **Smooth animations** and hover effects

## 📋 Requirements

- **Node.js 14+** and npm
- **Docker and Docker Compose** (optional, for containerized deployment)

## 💻 Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/baptisteba/FreeMobNotifier.git
   cd FreeMobNotifier
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev:watch
   ```
   *This runs both frontend and backend in watch mode*

   **Alternative development commands:**
   ```bash
   # Build client and start server (production-like)
   npm run dev
   
   # Run frontend and backend separately
   npm run dev:server  # Backend only
   npm run client      # Frontend only (in separate terminal)
   ```

5. Access the application at http://localhost:3000

## 🛠️ Debug Installation & Development

If you encounter issues during installation or startup:

1. Try installing dependencies separately:
   ```bash
   npm install
   cd src/client
   npm install
   cd ../..
   ```

2. Check for errors in your terminal output

3. Run the server and client separately for better error visibility:
   ```bash
   # Terminal 1 - Run the backend
   npm run dev:server
   
   # Terminal 2 - Run the frontend
   cd src/client
   npm run dev
   ```

4. Enable more verbose logging by adding to your `.env` file:
   ```
   DEBUG=true
   ```

## 💾 Database

The application uses **@seald-io/nedb**, a lightweight file-based database that is fully compatible with the MongoDB API but doesn't require a separate database server. All data is stored in the `./data` directory:

- `settings.db`: Stores Free Mobile API credentials
- `messages.db`: Stores all messages (immediate, scheduled, and recurring)

This approach makes the application much easier to set up and run without external dependencies.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/baptisteba/FreeMobNotifier.git
   cd FreeMobNotifier
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:18596

### Manual Docker Build

If you prefer to build and run the Docker container manually:

1. Build the Docker image:
   ```bash
   docker build -t freemobnotifier .
   ```

2. Run the container:
   ```bash
   docker run -d -p 18596:3000 -v $(pwd)/data:/app/data --name freemobnotifier freemobnotifier
   ```

3. Access the application at http://localhost:18596

### Port Configuration

The application is configured to expose the UI on port **18596** externally, while internally the container runs on port 3000. This means:

- **External Access**: http://localhost:18596 (UI and API both accessible)
- **Internal Container**: Port 3000 (handles both UI and API requests)

**Important**: You do **NOT** need to expose the API port separately because the Express server serves both:
- **Static UI files** (Vue.js production build)
- **API endpoints** (under `/api/*` routes)

Both are accessible through the same port (18596 externally, 3000 internally).

### Docker Volume and Persistence

The application data is stored in a Docker volume that persists across container restarts. This ensures your settings and message history are preserved.

```bash
# To view logs
docker-compose logs -f freemobnotifier

# To restart the container
docker-compose restart freemobnotifier

# To stop the container
docker-compose down
```

## ⚙️ Configuration

Before using the application, you need to configure your Free Mobile API credentials:

1. Log in to your Free Mobile account at https://mobile.free.fr/
2. Go to "My Options" section
3. Activate the "SMS Notifications" option if not already enabled
4. Copy your user ID and API key
5. Enter these credentials in the **Paramètres** (Settings) section of FreeMobNotifier
6. Test your configuration using the built-in test feature

## 🔧 Technical Features

### 🎨 Frontend (Vue.js 3)
- **Composition API** with reactive state management
- **Vue Router** for single-page application navigation
- **Custom components** (FreeDateTimePicker, enhanced navigation)
- **Responsive CSS** with mobile-first design
- **Modern JavaScript** (ES6+) with Vite build system

### ⚙️ Backend (Node.js/Express)
- **RESTful API** with dedicated endpoints
- **Automated scheduler** using node-cron for recurring messages
- **File-based database** with NeDB (MongoDB-compatible)
- **Error handling** and retry mechanisms
- **Secure credential storage**

### 📊 Smart Scheduling System
- **Cron-based scheduler** checking every minute
- **Intelligent recurrence handling** (daily, weekly, monthly)
- **Retry mechanism** for failed messages
- **Automatic cleanup** of old sent messages (30+ days)
- **Context-aware date formatting** (Today, Tomorrow, weekday names)

## 📡 API Documentation

The Free Mobile API is used as follows:

- **Endpoint**: `https://smsapi.free-mobile.fr/sendmsg`
- **Parameters**:
  - `user`: Your Free Mobile login ID
  - `pass`: Your API key
  - `msg`: Message content (max 160 characters)
- **Response codes**:
  - `200`: Success - SMS sent
  - `400`: Missing parameters
  - `402`: Rate limit exceeded
  - `403`: Service not activated or invalid credentials
  - `500`: Server error

## 🔄 Message Status Flow

1. **Pending**: Message scheduled, waiting for send time
2. **Sent**: Message successfully delivered to Free Mobile API
3. **Failed**: Delivery failed (with retry mechanism for one-time messages)

## 🎯 Browser Compatibility

FreeMobNotifier is tested and optimized for:
- **Mobile browsers**: Safari (iOS), Chrome (Android), Firefox Mobile
- **Desktop browsers**: Chrome, Firefox, Safari, Edge
- **Touch devices**: Optimized for touch interaction
- **Screen readers**: Accessible design with proper ARIA labels

## 📝 License

MIT License - see LICENSE file for details

---

Made with ❤️ for Free Mobile users who want smart SMS scheduling capabilities
