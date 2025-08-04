// services/websocket.service.ts

export class WebSocketService {
  private static getWebSocketUrl(): string | undefined {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  static notify(message: object): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.getWebSocketUrl();

      if (!wsUrl) {
        console.error("WebSocket URL is not configured.");
        return resolve(); // Skip breaking flow if URL is missing
      }

      console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          console.error("WebSocket connection timed out.");
          reject(new Error("WebSocket connection timed out after 8 seconds."));
        }
      }, 8000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("SUCCESS: Client connected to WebSocket server.");
        ws.send(JSON.stringify(message));
        console.log("Message sent successfully over WebSocket.");
        ws.close();
        resolve();
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error("WebSocket connection error:", error);
        reject(new Error("WebSocket connection failed."));
      };

      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        console.log("Client disconnected from WebSocket server.");
      };
    });
  }
}
