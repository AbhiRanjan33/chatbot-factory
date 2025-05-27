To start the app, download the required packages from requirements.txt and run npm run dev.
# Chatbot Application

This is a Next.js-based chatbot application that allows users to create and interact with chatbots, upload files, and manage conversation history. The application uses Clerk for authentication, MongoDB for data storage, and a custom backend API for chatbot functionality.

## Prerequisites

Before setting up the application, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** (version 9 or higher)
- A **MongoDB** database (e.g., MongoDB Atlas)
- A **Clerk** account for authentication

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd frontend
Install Dependencies

Install all required dependencies by running the following command:

bash

Copy
npm install
This will install all dependencies listed in package.json.

Configure Environment Variables

Create a .env.local file in the root of the project and add the following environment variables:

env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
MONGODB_URI=<your-mongodb-connection-string>
NEXT_PUBLIC_BACKEND_API_URL=<your-backend-api-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Your Clerk publishable key (e.g., pk_test_...). Obtain this from your Clerk dashboard.
CLERK_SECRET_KEY: Your Clerk secret key (e.g., sk_test_...). Obtain this from your Clerk dashboard.
NEXT_PUBLIC_CLERK_SIGN_IN_URL: The URL for the sign-in page (default: /sign-in).
NEXT_PUBLIC_CLERK_SIGN_UP_URL: The URL for the sign-up page (default: /sign-up).
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: The redirect URL after signing in (default: /).
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: The redirect URL after signing up (default: /).
MONGODB_URI: Your MongoDB connection string (e.g., mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority).
NEXT_PUBLIC_BACKEND_API_URL: The URL of the backend API (e.g., https://my-chatbot-factory.onrender.com).
Note: Ensure sensitive information like CLERK_SECRET_KEY and MONGODB_URI is kept secure and not committed to version control. Use .gitignore to exclude .env.local.

Run the Development Server

Start the Next.js development server:

bash
npm run dev
The application will be available at http://localhost:3000.

Build and Run for Production

To build the application for production:

bash
npm run build
To start the production server:

bash
npm start
I have attached the screenshots in the google form.


Chatbot API Documentation
This document describes the API endpoints used by the chatbot application to manage user authentication, chatbot creation, file uploads, conversation history, and chatbot interactions. The API is hosted at https://my-chatbot-factory.onrender.com/api/v1.
Base URL
https://my-chatbot-factory.onrender.com/api/v1

Authentication
Most endpoints require authentication via a Bearer token. The application uses two types of tokens:

Clerk Token: Obtained via Clerk's useAuth hook for authenticating requests to the /api/conversations and /api/chatbot-conversations endpoints.
Render Token: Obtained by logging into the backend via the /users/login endpoint, used for creating chatbots and uploading files.

Endpoints
1. User Login
Authenticates a user and returns a Render token for subsequent API calls.

Endpoint: /users/login
Method: POST
Headers:
Content-Type: application/json


Request Body:{
  "email": "string",
  "password": "string"
}


email: User's email address (e.g., test@example.com).
password: User's password (e.g., password123).


Response:
Success (200):{
  "status": "success",
  "token": "string",
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "name": "string"
    }
  }
}


token: JWT token for authenticating subsequent requests.


Error (401):{
  "status": "error",
  "message": "Invalid credentials"
}




Description: Authenticates a user and returns a token used for creating chatbots and uploading files.

2. Create Chatbot
Creates a new chatbot with a specified name and prompt.

Endpoint: /chatbots
Method: POST
Headers:
Content-Type: application/json
Authorization: Bearer <render_token>


Request Body:{
  "name": "string",
  "prompt": "string"
}


name: Name of the chatbot (e.g., Chatbot-1697051234567).
prompt: The initial prompt or conversation history to initialize the chatbot.


Response:
Success (201):{
  "status": "success",
  "data": {
    "chatbot": {
      "_id": "string",
      "name": "string",
      "apiEndpoint": "string",
      "createdAt": "string"
    },
    "response": "string"
  }
}


chatbot.apiEndpoint: The endpoint for interacting with the created chatbot (e.g., /api/v1/chatbots/chat/chbt_ce8e8905d3da437983b02a9ceb51327d).
response: The chatbot's initial response.


Error (400):{
  "status": "error",
  "message": "Chatbot creation failed"
}




Description: Creates a new chatbot instance and returns its unique API endpoint.

3. Upload Files to Chatbot
Uploads PDF or TXT files to a specific chatbot for processing.

Endpoint: /chatbots/:chatbotId/upload
Method: POST
Headers:
Authorization: Bearer <render_token>


Request Body: Form-data with key file containing one or more PDF or TXT files.
URL Parameters:
chatbotId: The unique ID of the chatbot (e.g., chbt_ce8e8905d3da437983b02a9ceb51327d).


Response:
Success (200):{
  "status": "success",
  "data": {
    "files": ["string"]
  }
}


files: Array of uploaded file names.


Error (400):{
  "status": "error",
  "message": "File upload failed"
}




Description: Uploads files to the specified chatbot. Only PDF and TXT files are supported.

4. Chat with Chatbot
Sends a message to a chatbot and receives a response.

Endpoint: /chatbots/chat/:chatbotId
Method: POST
Headers:
Content-Type: application/json


URL Parameters:
chatbotId: The unique ID of the chatbot (e.g., chbt_ce8e8905d3da437983b02a9ceb51327d).


Request Body:{
  "message": "string"
}


message: The user's message to the chatbot.


Response:
Success (200):{
  "status": "success",
  "data": {
    "response": "string"
  }
}


response: The chatbot's response to the message.


Error (400):{
  "status": "error",
  "message": "Chat failed"
}




Description: Sends a message to the specified chatbot and retrieves its response. No authentication is required for this endpoint.

5. Fetch Conversations (Session-Specific)
Retrieves conversation history for a specific session.

Endpoint: /api/conversations
Method: GET
Headers:
Content-Type: application/json
Authorization: Bearer <clerk_token>


Query Parameters:
sessionId: The unique session ID for which to fetch conversations.


Response:
Success (200):[
  {
    "_id": "string",
    "sessionId": "string",
    "prompt": "string",
    "apiLink": "string",
    "files": ["string"],
    "response": "string",
    "createdAt": "string"
  }
]


prompt: The user's input or prompt.
apiLink: The chatbot's API endpoint.
files: Array of uploaded file names (if any).
response: The chatbot's response.
createdAt: Timestamp of the conversation.


Error (400):{
  "error": "Failed to load chat history"
}




Description: Retrieves all conversations associated with a specific session ID.

6. Fetch All Conversations
Returns all conversations for the authenticated user.

Endpoint: /api/conversations
Method: GET
Headers:
Content-Type: application/json
Authorization: Bearer <clerk_token>


Response:
Success (200):[
  {
    "_id": "string",
    "sessionId": "string",
    "prompt": "string",
    "apiLink": "string",
    "files": ["string"],
    "response": "string",
    "createdAt": "string"
  }
]


Error (400):{
  "error": "Failed to load conversation history"
}




Description: Retrieves all conversations for the authenticated user across all sessions.

7. Save Conversation
Saves a new conversation to the backend.

Endpoint: /api/conversations
Method: POST
Headers:
Content-Type: application/json
Authorization: Bearer <clerk_token>


Request Body:{
  "sessionId": "string",
  "prompt": "string",
  "apiLink": "string",
  "files": ["string"],
  "response": "string"
}


sessionId: The unique session ID.
prompt: The user's input or prompt.
apiLink: The chatbot's API endpoint.
files: Array of uploaded file names (if any).
response: The chatbot's response.


Response:
Success (201):{
  "_id": "string",
  "sessionId": "string",
  "prompt": "string",
  "apiLink": "string",
  "files": ["string"],
  "response": "string",
  "createdAt": "string"
}


Error (400):{
  "error": "Failed to save conversation"
}




Description: Saves a new conversation to the backend for the authenticated user.

8. Fetch Chatbot Conversations
Retrieves conversation history for a specific chatbot API endpoint.

Endpoint: /api/chatbot-conversations
Method: GET
Headers:
Content-Type: application/json
Authorization: Bearer <clerk_token>


Query Parameters:
apiEndpoint: The chatbot's API endpoint (e.g., https://my-chatbot-factory.onrender.com/api/v1/chatbots/chat/chbt_ce8e8905d3da437983b02a9ceb51327d).


Response:
Success (200):[
  {
    "role": "user" | "bot",
    "content": "string"
  }
]


role: Either user or bot, indicating the message sender.
content: The message content.


Error (400):{
  "error": "Failed to fetch conversations"
}




Description: Retrieves the conversation history for a specific chatbot.

9. Save Chatbot Conversation
Saves a new conversation entry for a specific chatbot.

Endpoint: /api/chatbot-conversations
Method: POST
Headers:
Content-Type: application/json
Authorization: Bearer <clerk_token>


Request Body:{
  "prompt": "string",
  "response": "string",
  "apiEndpoint": "string"
}


prompt: The user's input.
response: The chatbot's response.
apiEndpoint: The chatbot's API endpoint.


Response:
Success (201):{
  "status": "success",
  "data": {
    "prompt": "string",
    "response": "string",
    "apiEndpoint": "string",
    "createdAt": "string"
  }
}


Error (400):{
  "error": "Failed to save conversation"
}




Description: Saves a user-bot conversation for a specific chatbot.

Error Handling

400 Bad Request: Invalid input or missing required fields.

401 Unauthorized: Missing or invalid authentication token.

500 Internal Server Error: Server-side issue; contact support if persistent.

Notes

The cleanApiLink function is used to normalize API endpoints by removing duplicate /api/v1 segments, ensuring consistent URL handling.
File uploads are restricted to PDF and TXT formats.
The application uses Clerk for user authentication, and a separate Render token is required for backend operations like chatbot creation and file uploads.
Session management is handled using UUIDs stored in local storage, allowing users to resume sessions via the sessionId query parameter.

