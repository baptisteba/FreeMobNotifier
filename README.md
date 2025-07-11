# 📱FreeMobNotifier

A modern, mobile-optimized Progressive Web App (PWA) for sending SMS notifications through the Free Mobile API with advanced scheduling capabilities and full dark mode support.

## ✨ Features

- 📤 **Immediate SMS sending** with real-time feedback
- 🕒 **Advanced scheduling** with one-time and recurring messages
- 🔁 **Flexible recurrence options** (daily, weekly, monthly)
- 📋 **Separate dedicated views** for different message types
- 🔍 **Smart search and filtering** with pagination
- 📱 **Progressive Web App (PWA)** - installable on all devices
- 🌙 **Full dark mode support** with automatic theme switching
- 🎨 **Modern theming system** with smooth transitions
- 📱 **Mobile-first responsive design** optimized for all devices
- ⚙️ **Secure credential management** with test functionality
- 🗄️ **Local file-based database** (no external database required)
- 🎨 **Modern card-based interface** with touch-friendly navigation
- ⏰ **Smart date formatting** and compact message display
- 📈 **Complete message tracking** with individual history for recurring messages
- 🔄 **Persistent recurring schedules** that maintain active status
- 🌐 **Offline functionality** with intelligent caching
- 🔄 **Background sync** for sending messages when back online
- 📲 **Install prompt** for native app-like experience

## 🌙 Dark Mode & Theming

FreeMobNotifier features a comprehensive dark mode system:

- **🎨 Complete dark theme** - All components support dark mode
- **⚙️ Theme selector** - Available in Settings page for easy switching
- **🌓 Automatic persistence** - Your theme choice is saved locally
- **🔄 Smooth transitions** - Seamless switching between light and dark modes
- **📱 System preference detection** - Automatically detects your device's theme preference
- **🎯 Consistent theming** - All form controls, buttons, and components adapt to the chosen theme

### Theme Features:
- **Light mode**: Clean, professional appearance with #f8f8f8 backgrounds
- **Dark mode**: Eye-friendly dark theme with #1a1a1a backgrounds
- **CSS variables**: Comprehensive theming system with smooth 0.3s transitions
- **Component support**: All custom components (DateTimePicker, modals, etc.) adapt automatically

## 📱 Progressive Web App (PWA)

FreeMobNotifier is a full-featured PWA that can be installed like a native app:

### 🚀 PWA Features:
- **📲 Installable** on Android, iOS, and desktop
- **🌐 Offline support** with intelligent caching
- **⚡ Fast loading** with service worker caching
- **🔄 Background sync** for offline message queuing
- **📱 Native app experience** with fullscreen mode
- **🎯 App shortcuts** for quick actions
- **🔄 Automatic updates** with service worker
- **🎨 Custom splash screen** with app branding

### 📲 Installation:
- **Android/Desktop**: Look for install prompt or use the "Install App" button
- **iOS**: Use Share → "Add to Home Screen"
- **All platforms**: Works like a native app once installed

*See [PWA_SETUP_INSTRUCTIONS.md](PWA_SETUP_INSTRUCTIONS.md) for detailed setup guide.*

## 🚀 Application Structure

FreeMobNotifier features a clean, intuitive interface with four main sections:

### 🏠 Accueil (Home)
Central hub for sending and scheduling messages with two tabs:

**📤 Envoyer maintenant (Send Now)**
- Compose and send SMS messages immediately
- Real-time character counter (160 chars max)
- Instant delivery feedback

**⏰ Programmer (Schedule)**
- Create scheduled messages with **custom FreeDateTimePicker component**
- **Dark mode aware** date picker with theme integration
- **One-time messages**: Set specific date and time
- **Recurring options**:
  - **Daily**: Send every day at specified time
  - **Weekly**: Choose specific days of the week
  - **Monthly**: Select day of the month
- Visual recurrence configuration with toggle buttons

### 📜 Historique (Message History)
Dedicated view for **sent messages only**:
- **Individual history entries** for each recurring message sent
- **Chronological ordering** from newest to oldest (most recent on top)
- Search functionality across message content
- Pagination for easy navigation
- Modern card-based display with dark mode support
- Expandable message content for long texts
- Smart date formatting for readability

### 🕐 Programmés (Scheduled Messages)
Separate management view for **pending/scheduled messages**:
- **Enhanced filter controls** with dark mode styling
- Filter by recurrence type (daily, weekly, monthly, one-time)
- Compact date display with contextual formatting
- Delete scheduled messages with confirmation
- Real-time status updates
- **Custom dropdown styling** with theme-aware arrows

### ⚙️ Paramètres (Settings)
Comprehensive configuration management:

**🔧 Free Mobile API Configuration:**
- Free Mobile API credentials setup
- Test SMS functionality
- Credential validation with feedback
- Secure storage of sensitive data

**🎨 Interface Preferences:**
- **Theme selector** with visual light/dark mode buttons
- **Instant theme switching** with live preview
- **Automatic persistence** of theme choice
- **System preference detection** for initial theme

## 📱 Mobile Optimization

FreeMobNotifier is built with a **mobile-first approach**:

### 🎯 Touch-Friendly Design
- **44px minimum touch targets** for all interactive elements
- **Bottom navigation bar** for easy thumb access
- **16px font size** on form inputs (prevents iOS zoom)
- **Enhanced dropdowns** with improved styling and dark mode support
- **Swipe-friendly card layouts**
- **Custom date picker** optimized for mobile interaction

### 📐 Responsive Breakpoints
- **≤360px**: Very small mobile devices with optimized theme selector
- **361-480px**: Standard mobile phones with stacked theme options
- **481-767px**: Large phones and small tablets
- **≥768px**: Tablets and desktop with side-by-side theme controls

### 🎨 Modern Interface
- **Card-based layouts** replacing traditional tables
- **Gradient headers** with visual status indicators
- **Smart spacing** optimized for different screen sizes
- **Professional typography** with consistent font weights
- **Smooth animations** and hover effects
- **CSS Grid and Flexbox** for modern layouts
- **Theme-aware shadows** and borders

### 🎨 Enhanced UI Components
- **FreeDateTimePicker**: Custom Vue 3 component with dark mode support
- **InstallPWA**: Smart installation component with cross-platform guidance
- **Theme-aware form controls**: All inputs, selects, and buttons adapt to theme
- **Responsive navigation**: Mobile bottom bar, desktop top navigation
- **Modern dropdowns**: Custom styling with theme-aware arrows

## 📋 Requirements

- **Node.js 14+** and npm
- **Docker and Docker Compose** (optional, for containerized deployment)
- **HTTPS** (required for PWA features in production)

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

### 🔧 PWA Development Testing

For PWA features in development:
```bash
# Generate required PWA icons
open http://localhost:3000/generate-icons.html

# Test PWA installation
# Use Chrome DevTools → Application → Manifest to verify PWA compliance
```

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

- `settings.db`: Stores Free Mobile API credentials and user preferences
- `messages.db`: Stores all messages (immediate, scheduled, recurring, and history)

### 📊 Message Data Structure

The system intelligently manages different types of messages:

**Recurring Messages** (`status: 'pending'`):
- Original scheduling templates that remain active
- Contain recurrence configuration (daily, weekly, monthly)
- Updated with `lastSent` timestamp after each successful send
- Never change to "sent" status to maintain recurring schedule

**History Entries** (`status: 'sent'`):
- Individual records created for each successful message delivery
- Linked to original recurring message via `originalRecurringMessageId`
- Sorted by actual send time for chronological history display
- Include exact timestamp when message was delivered

**One-time Messages**:
- Single messages that change from "pending" to "sent" when delivered
- No separate history entries needed

This approach makes the application much easier to set up and run without external dependencies while providing complete message tracking.

### 🎯 Benefits of the Enhanced Message System

**Complete History Tracking**:
- Every message sent (recurring or one-time) appears in history
- Chronological order shows exactly when each message was delivered
- Easy to track frequency and success of recurring messages

**Persistent Scheduling**:
- Recurring messages continue working indefinitely
- No need to recreate schedules after each send
- Clear separation between active schedules and delivery history

**Improved Organization**:
- **Scheduled view**: Shows active recurring schedules
- **History view**: Shows all delivered messages
- **Smart filtering**: Find specific messages easily

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

*See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions including HTTPS setup for PWA features.*

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
- **Static UI files** (Vue.js production build with PWA assets)
- **API endpoints** (under `/api/*` routes)

Both are accessible through the same port (18596 externally, 3000 internally).

### Docker Volume and Persistence

The application data is stored in a Docker volume that persists across container restarts. This ensures your settings, theme preferences, and message history are preserved.

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
6. **Choose your preferred theme** (light/dark) in the Interface Preferences section
7. Test your configuration using the built-in test feature

## 🔧 Technical Features

### 🎨 Frontend (Vue.js 3)
- **Composition API** with reactive state management
- **Vue Router** for single-page application navigation
- **Custom components** (FreeDateTimePicker, InstallPWA, enhanced navigation)
- **useTheme composable** for comprehensive theme management
- **CSS variables system** with smooth transitions
- **Responsive CSS** with mobile-first design
- **Modern JavaScript** (ES6+) with Vite build system
- **PWA manifest** and service worker integration

### 🌙 Theming System
- **CSS custom properties** for comprehensive theming
- **Global theme state** with Vue 3 Composition API
- **localStorage persistence** for theme preferences
- **System preference detection** via `prefers-color-scheme`
- **Smooth 0.3s transitions** between themes
- **Component-level theme support** across all elements

### ⚙️ Backend (Node.js/Express)
- **RESTful API** with dedicated endpoints
- **Automated scheduler** using node-cron for recurring messages
- **File-based database** with NeDB (MongoDB-compatible)
- **Error handling** and retry mechanisms
- **Secure credential storage**
- **PWA asset serving** with proper caching headers

### 📊 Smart Scheduling System
- **Cron-based scheduler** checking every minute
- **Intelligent recurrence handling** (daily, weekly, monthly)
- **Individual history tracking** - each recurring message send creates a separate history entry
- **Smart message ordering** - history sorted by actual send time (newest first)
- **Persistent recurring schedules** - original recurring message stays active for future sends
- **Retry mechanism** for failed messages
- **Automatic cleanup** of old sent messages (30+ days)
- **Context-aware date formatting** (Today, Tomorrow, weekday names)

### 📱 PWA Infrastructure
- **Service Worker** with intelligent caching strategies
- **Web App Manifest** with complete configuration
- **Offline support** with cached UI and background sync
- **InstallPWA component** with cross-platform installation guidance
- **App shortcuts** for quick access to key features
- **Push notification ready** infrastructure

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

### One-time Messages:
1. **Pending**: Message scheduled, waiting for send time
2. **Sent**: Message successfully delivered to Free Mobile API
3. **Failed**: Delivery failed (with retry mechanism)

### Recurring Messages:
1. **Pending**: Recurring schedule active, waiting for next occurrence
2. **When sent**: Creates separate **"Sent"** history entry for each delivery
3. **Original schedule**: Remains **"Pending"** for future occurrences
4. **History tracking**: Each successful send appears individually in Message History

### Message History Display:
- **Chronological order**: Most recent messages appear first
- **Smart sorting**: Uses actual send time for accurate ordering
- **Individual entries**: Each recurring message send creates its own history record

## 🎯 Browser Compatibility

FreeMobNotifier is tested and optimized for:
- **Mobile browsers**: Safari (iOS), Chrome (Android), Firefox Mobile
- **Desktop browsers**: Chrome, Firefox, Safari, Edge
- **Touch devices**: Optimized for touch interaction
- **Screen readers**: Accessible design with proper ARIA labels
- **PWA support**: Full PWA features on compatible browsers
- **Dark mode**: Automatic detection and manual override support

## 📚 Documentation

- **[PWA Setup Instructions](PWA_SETUP_INSTRUCTIONS.md)** - Complete PWA configuration guide
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment with HTTPS setup
- **[License](LICENSE)** - MIT License details

## 📝 License

MIT License - see LICENSE file for details

---

Made with ❤️ for Free Mobile users who want smart SMS scheduling capabilities with modern PWA features and beautiful dark mode support
