# 📱 FreeMobNotifier

A web application for sending SMS notifications through the Free Mobile API with scheduling capabilities.

## ✨ Features

- 📤 Send immediate SMS notifications
- 🕒 Schedule one-time messages for future delivery
- 🔁 Create recurring messages (daily, weekly, monthly)
- 📋 View message history with search and pagination
- ⚙️ Configure Free Mobile API credentials
- 🔒 Secure credential storage
- 📊 Uses local file-based database (no external database server required)
- 📱 Mobile-responsive interface

## 🚀 How It Works

FreeMobNotifier connects to the Free Mobile SMS notification API, which allows Free Mobile subscribers to send SMS messages to their phone number. The application has three main sections:

### 🏠 Home

- **Send Now Tab**: Compose and send SMS messages immediately
- **Schedule Tab**: Create one-time or recurring messages:
  - **One-time**: Set a specific date and time
  - **Daily**: Send every day at a specific time
  - **Weekly**: Send on selected days of the week
  - **Monthly**: Send on a specific day of each month

### 📝 Message History

- **Scheduled Messages**: View and manage pending scheduled messages
- **Sent Messages**: Review previously sent messages with search functionality and pagination

### ⚙️ Settings

- Configure your Free Mobile API credentials (user ID and API key)
- Test your configuration by sending a test SMS

## 📋 Requirements

- Node.js 14+ and npm
- Docker and Docker Compose (optional, for containerized deployment)

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
   npm run dev:all
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
   npm run dev
   
   # Terminal 2 - Run the frontend
   cd src/client
   npm run dev
   ```

4. Enable more verbose logging by adding to your `.env` file:
   ```
   DEBUG=true
   ```

## 💾 Database

The application uses @seald-io/nedb, a lightweight file-based database that is fully compatible with the MongoDB API but doesn't require a separate database server. All data is stored in the `./data` directory in the following files:

- `settings.db`: Stores the Free Mobile API credentials
- `messages.db`: Stores all messages (immediate, scheduled, and recurring)

This approach makes the application much easier to set up and run without external dependencies.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freemobnotifier.git
   cd freemobnotifier
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
# Or with manual Docker:
# docker logs -f freemobnotifier-app

# To restart the container
docker-compose restart freemobnotifier
# Or with manual Docker:
# docker restart freemobnotifier-app

# To stop the container
docker-compose down
# Or with manual Docker:
# docker stop freemobnotifier-app
```

## ⚙️ Configuration

Before using the application, you need to configure your Free Mobile API credentials:

1. Log in to your Free Mobile account at https://mobile.free.fr/
2. Go to "My Options" section
3. Activate the "SMS Notifications" option if not already enabled
4. Copy your user ID and API key
5. Enter these credentials in the Settings page of the FreeMobNotifier application

## 📡 API Documentation

The Free Mobile API is used as follows:

- Endpoint: `https://smsapi.free-mobile.fr/sendmsg`
- Parameters:
  - `user`: Your Free Mobile login ID
  - `pass`: Your API key
  - `msg`: Message content
- Response codes:
  - 200: Success - SMS sent
  - 400: Missing parameters
  - 402: Rate limit exceeded
  - 403: Service not activated or invalid credentials
  - 500: Server error

## 🔍 Troubleshooting

### API Connectivity Issues
- Ensure your Free Mobile API credentials are correct
- Verify that the service is activated in your Free Mobile account
- Check your network connectivity to the Free Mobile API

### Database Issues
- Check that the `./data` directory exists and is writable
- If using Docker, ensure the volume is properly mounted

### Scheduled Messages Not Sending
- Verify your system time is correctly set
- Check that the application is running continuously
- Look for any error messages in the server logs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 
