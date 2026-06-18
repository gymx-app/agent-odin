class DisabledRealtimeTransport {
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;
  readonly readyState = this.CLOSED;
  readonly protocol = '';
  readonly url: string;
  onopen: ((event: Event) => unknown) | null = null;
  onmessage: ((event: MessageEvent) => unknown) | null = null;
  onclose: ((event: CloseEvent) => unknown) | null = null;
  onerror: ((event: Event) => unknown) | null = null;

  constructor(url: string | URL, _subprotocols?: string | string[]) {
    this.url = url.toString();
  }

  close(): void {}

  send(): void {
    throw new Error('Supabase Realtime is not enabled for agent-odin.');
  }

  addEventListener(): void {}

  removeEventListener(): void {}
}

export const supabaseClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    // Odin uses Auth and PostgREST only. Supplying a transport prevents
    // supabase-js from requiring a global WebSocket during Node.js startup.
    transport: DisabledRealtimeTransport,
  },
};
