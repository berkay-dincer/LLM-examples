# Model Context Protocol (MCP) Server

A TypeScript implementation of a Model Context Protocol server that manages user preferences and conversation context for AI assistants.

## Features

- Store and retrieve user preferences
- Manage conversation history
- Handle multiple users
- RESTful API endpoints

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## API Endpoints

### Health Check
```
GET /health
```
Returns the server status.

### Context Management
```
POST /context
```
Manage user context with the following request body:

```typescript
{
  userId: string;
  action: 'get' | 'update' | 'clear';
  data?: {
    preferences?: {
      language?: string;
      tone?: 'formal' | 'casual' | 'professional';
      interests?: string[];
    };
    conversationHistory?: {
      timestamp: string;
      message: string;
      response: string;
    }[];
  }
}
```

## Example Usage

### Get User Context
```bash
curl -X POST http://localhost:3000/context \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "action": "get"}'
```

### Update User Preferences
```bash
curl -X POST http://localhost:3000/context \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "action": "update",
    "data": {
      "preferences": {
        "language": "en",
        "tone": "casual",
        "interests": ["technology", "science"]
      }
    }
  }'
```

### Clear User Context
```bash
curl -X POST http://localhost:3000/context \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "action": "clear"}'
``` 