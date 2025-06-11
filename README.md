# BFF Debugger Chrome Extension

A Chrome extension for debugging Backend-For-Frontend (BFF) applications. This extension provides real-time monitoring of network requests and console output from your BFF server.

## Features

- Real-time network request monitoring
- Request/response details inspection
- Console output monitoring
- WebSocket connection to BFF server

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/browser` directory

## Usage

1. Open Chrome DevTools (F12 or right-click -> Inspect)
2. Go to the "BFF Debugger" tab
3. The extension will automatically connect to your BFF server at `ws://localhost:3000`
4. Monitor network requests and console output in real-time

## Development

1. Start the development server:
   ```bash
   npm start
   ```
2. Build the extension in watch mode:
   ```bash
   npm run watch
   ```

## Backend Integration

To integrate with your BFF server, you need to implement a WebSocket server that sends events in the following format:

```typescript
// Request Started Event
{
  type: 'requestStarted',
  requestId: string,
  data: {
    id: string,
    method: string,
    url: string,
    headers: object,
    body: any,
    timestamp: string,
    state: 'pending',
    timing: {
      startTime: number,
      endTime: number,
      dnsStart: number,
      dnsEnd: number,
      connectStart: number,
      connectEnd: number,
      sslStart: number,
      sslEnd: number,
      sendStart: number,
      sendEnd: number,
      receiveHeadersStart: number,
      receiveHeadersEnd: number,
      receiveBodyStart: number,
      receiveBodyEnd: number
    }
  },
  timing: RequestTiming
}

// Request Completed Event
{
  type: 'requestEnded',
  requestId: string,
  data: {
    request: RequestData,
    response: {
      id: string,
      statusCode: number,
      headers: object,
      body: any,
      state: 'completed',
      timing: RequestTiming,
      timestamp: string
    }
  },
  timing: RequestTiming
}

// Request Failed Event
{
  type: 'requestFailed',
  requestId: string,
  data: {
    request: RequestData,
    error: {
      id: string,
      error: string,
      state: 'failed',
      timing: RequestTiming,
      timestamp: string
    }
  },
  timing: RequestTiming
}

// Console Output Event
{
  type: 'stdout',
  data: {
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  }
}
```

## License

MIT
