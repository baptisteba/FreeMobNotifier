# FreeMobNotifier

A web application for sending SMS notifications through the Free Mobile API with scheduling capabilities.

## Features

- Send immediate SMS notifications
- Schedule one-time messages for future delivery
- Create recurring messages (daily, weekly, monthly)
- View message history and status
- Configure Free Mobile API credentials
- Uses local file-based database (no external database server required)

## Requirements

- Node.js 14+ and npm
- Docker and Docker Compose (optional, for containerized deployment)

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freemobnotifier.git
   cd freemobnotifier
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

## Database

The application uses NeDB, a lightweight file-based database that is fully compatible with the MongoDB API but doesn't require a separate database server. All data is stored in the `./data` directory in the following files:

- `settings.db`: Stores the Free Mobile API credentials
- `messages.db`: Stores all messages (immediate, scheduled, and recurring)

This approach makes the application much easier to set up and run without external dependencies.

## Docker Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/freemobnotifier.git
   cd freemobnotifier
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:3000

## Configuration

Before using the application, you need to configure your Free Mobile API credentials:

1. Log in to your Free Mobile account at https://mobile.free.fr/
2. Go to "My Options" section
3. Activate the "SMS Notifications" option if not already enabled
4. Copy your user ID and API key
5. Enter these credentials in the Settings page of the FreeMobNotifier application

## API Documentation

The Free Mobile API is used as follows:

- Endpoint: `https://smsapi.free-mobile.fr/sendmsg`
- Parameters:
  - `user`: Your Free Mobile login ID
  - `pass`: Your API key
  - `msg`: Message content (URL-encoded for GET requests)
- Response codes:
  - 200: Success - SMS sent
  - 400: Missing parameters
  - 402: Rate limit exceeded
  - 403: Service not activated or invalid credentials
  - 500: Server error

## Troubleshooting

### API Connectivity Issues
- Ensure your Free Mobile API credentials are correct
- Verify that the service is activated in your Free Mobile account
- Check your network connectivity to the Free Mobile API

## License

This project is licensed under the MIT License - see the LICENSE file for details. 