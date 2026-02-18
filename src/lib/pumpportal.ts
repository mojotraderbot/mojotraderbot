/**
 * PumpPortal WebSocket API integration for real-time trade updates
 * Documentation: https://pumpportal.fun/data-api/real-time/
 */

const PUMPPORTAL_WS_URL = "wss://pumpportal.fun/api/data";

export interface PumpPortalTradeEvent {
  signature: string;
  timestamp: number;
  account: string;
  mint: string;
  type: "buy" | "sell";
  solAmount: number;
  tokenAmount: number;
  dex?: string;
}

export interface PumpPortalMessage {
  method?: string;
  keys?: string[];
  signature?: string;
  account?: string;
  mint?: string;
  type?: "buy" | "sell";
  solAmount?: number;
  tokenAmount?: number;
  timestamp?: number;
  [key: string]: unknown;
}

/**
 * Create and manage PumpPortal WebSocket connection
 */
export class PumpPortalWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isManualClose = false;
  private subscribedAccounts: Set<string> = new Set();
  private onTradeCallback: ((trade: PumpPortalTradeEvent) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;

  constructor() {
    // Auto-reconnect logic will be handled in connect()
  }

  /**
   * Set callback for new trade events
   */
  onTrade(callback: (trade: PumpPortalTradeEvent) => void) {
    this.onTradeCallback = callback;
  }

  /**
   * Set callback for connection errors
   */
  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for successful connection
   */
  onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  /**
   * Connect to PumpPortal WebSocket
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[PumpPortal] Already connected");
      return;
    }

    this.isManualClose = false;
    console.log("[PumpPortal] Connecting to WebSocket...");

    try {
      this.ws = new WebSocket(PUMPPORTAL_WS_URL);

      this.ws.onopen = () => {
        console.log("[PumpPortal] WebSocket connected");
        this.reconnectAttempts = 0;
        this.onConnectCallback?.();

        // Re-subscribe to previously subscribed accounts
        if (this.subscribedAccounts.size > 0) {
          this.subscribeAccountTrade(Array.from(this.subscribedAccounts));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: PumpPortalMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("[PumpPortal] Failed to parse message:", error, event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[PumpPortal] WebSocket error:", error);
        this.onErrorCallback?.(new Error("WebSocket connection error"));
      };

      this.ws.onclose = (event) => {
        console.log("[PumpPortal] WebSocket closed", event.code, event.reason);
        this.ws = null;

        // Auto-reconnect if not manually closed
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(`[PumpPortal] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), delay);
        }
      };
    } catch (error) {
      console.error("[PumpPortal] Failed to create WebSocket:", error);
      this.onErrorCallback?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Subscribe to trades for specific accounts
   */
  subscribeAccountTrade(accounts: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[PumpPortal] WebSocket not connected, will subscribe after connection");
      accounts.forEach(acc => this.subscribedAccounts.add(acc));
      return;
    }

    accounts.forEach(acc => this.subscribedAccounts.add(acc));

    const payload: PumpPortalMessage = {
      method: "subscribeAccountTrade",
      keys: accounts,
    };

    try {
      this.ws.send(JSON.stringify(payload));
      console.log(`[PumpPortal] Subscribed to trades for ${accounts.length} account(s)`);
    } catch (error) {
      console.error("[PumpPortal] Failed to send subscription:", error);
    }
  }

  /**
   * Unsubscribe from trades for specific accounts
   */
  unsubscribeAccountTrade(accounts: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    accounts.forEach(acc => this.subscribedAccounts.delete(acc));

    const payload: PumpPortalMessage = {
      method: "unsubscribeAccountTrade",
      keys: accounts,
    };

    try {
      this.ws.send(JSON.stringify(payload));
      console.log(`[PumpPortal] Unsubscribed from trades for ${accounts.length} account(s)`);
    } catch (error) {
      console.error("[PumpPortal] Failed to send unsubscription:", error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: PumpPortalMessage) {
    // Check if this is a trade event
    if (message.signature && message.account && message.mint) {
      const trade: PumpPortalTradeEvent = {
        signature: message.signature,
        timestamp: message.timestamp || Math.floor(Date.now() / 1000),
        account: message.account,
        mint: message.mint,
        type: message.type || (message.solAmount && message.solAmount > 0 ? "buy" : "sell"),
        solAmount: message.solAmount || 0,
        tokenAmount: message.tokenAmount || 0,
        dex: message.dex as string | undefined,
      };

      console.log("[PumpPortal] New trade event:", trade);
      this.onTradeCallback?.(trade);
    } else {
      // Log other message types for debugging
      console.log("[PumpPortal] Received message:", message);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedAccounts.clear();
    console.log("[PumpPortal] Disconnected");
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
