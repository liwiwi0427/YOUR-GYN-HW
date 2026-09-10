import express from 'express';
import path from 'path';
import dgram from 'dgram';
import { createServer as createViteServer } from 'vite';

const NTP_SERVERS = [
  'watch.stdtime.gov.tw',
  'time.stdtime.gov.tw',
  'clock.stdtime.gov.tw',
  'tick.stdtime.gov.tw',
];

/**
 * Query NTP time from Taiwan Standard Time servers
 */
function queryNtp(host: string, timeoutMs: number = 2500): Promise<{ timestamp: number; server: string }> {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const ntpPacket = Buffer.alloc(48);
    ntpPacket[0] = 0x1b; // LI=0, VN=3, Mode=3 (Client)

    let timer: NodeJS.Timeout;

    client.on('message', (msg) => {
      clearTimeout(timer);
      try {
        client.close();
      } catch {}
      if (msg.length >= 48) {
        const seconds = msg.readUInt32BE(40);
        const fraction = msg.readUInt32BE(44);
        const ntpEpochDiff = 2208988800; // Seconds between 1900 and 1970
        const unixTimestampMs = (seconds - ntpEpochDiff) * 1000 + Math.floor((fraction * 1000) / 0x100000000);
        resolve({ timestamp: unixTimestampMs, server: host });
      } else {
        reject(new Error('Invalid NTP packet length'));
      }
    });

    client.on('error', (err) => {
      clearTimeout(timer);
      try {
        client.close();
      } catch {}
      reject(err);
    });

    timer = setTimeout(() => {
      try {
        client.close();
      } catch {}
      reject(new Error('NTP request timeout'));
    }, timeoutMs);

    client.send(ntpPacket, 0, 48, 123, host, (err) => {
      if (err) {
        clearTimeout(timer);
        try {
          client.close();
        } catch {}
        reject(err);
      }
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Taiwan Standard Time NTP endpoint
  app.get('/api/time', async (req, res) => {
    const requestedServer = (req.query.server as string) || NTP_SERVERS[0];
    const serverToUse = NTP_SERVERS.includes(requestedServer) ? requestedServer : NTP_SERVERS[0];

    try {
      const ntpResult = await queryNtp(serverToUse);
      res.json({
        success: true,
        timestamp: ntpResult.timestamp,
        iso: new Date(ntpResult.timestamp).toISOString(),
        server: ntpResult.server,
        servers: NTP_SERVERS,
        source: 'NTP_UDP',
      });
    } catch {
      // Fallback to server clock if UDP is restricted
      const now = Date.now();
      res.json({
        success: true,
        timestamp: now,
        iso: new Date(now).toISOString(),
        server: serverToUse,
        servers: NTP_SERVERS,
        source: 'SYSTEM_FALLBACK',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
