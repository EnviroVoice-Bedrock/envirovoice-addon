import {
  HttpRequest,
  HttpHeader,
  HttpRequestMethod,
  http,
} from "@minecraft/server-net";

export class Socket {
  constructor(url) {
    // Remove trailing slash if present
    this.url = url.endsWith('/') ? url.slice(0, -1) : url;
    this.onUpdate = null; // Single callback for all updates
  }

  /**
   * Send data to server and handle response
   */
  send(data) {
    if (!this.url || this.url.includes("...")) return;

    const request = new HttpRequest(this.url + "/minecraft-data");
    request.method = HttpRequestMethod.Post;
    request.headers = [new HttpHeader("Content-Type", "application/json")];
    request.body = JSON.stringify(data);

    http
      .request(request)
      .then((response) => {
        if (response.body) {
          try {
            const responseData = JSON.parse(response.body);
            
            // Execute callback with the data received from the Web (via backend)
            // This data will contain who is talking, muted, etc. based on LiveKit
            if (this.onUpdate && responseData.voiceStates) {
                this.onUpdate(responseData.voiceStates);
            }
          } catch (e) {
            // Siltent catch to avoid console spam on json errors
          }
        }
      })
      .catch((error) => {
        // Connection error (server might be sleeping)
      });
  }

  /**
   * Set callback to handle data coming back from the web
   */
  setOnUpdateCallback(callback) {
    this.onUpdate = callback;
  }
}