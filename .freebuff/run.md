# Run doc — adamportfolio

Vite + React dev server (npm).

## Reproduce artifacts

No env files are required. Install dependencies once:

```bash
npm install
```

This creates `node_modules/` (and refreshes `package-lock.json` if needed).

## Run the server

Start the dev server on port 5173, detached. Bind explicitly to IPv4 loopback
so the thread Preview tab can reach it. Keep the launching shell alive for a
few seconds after `disown` — if the command returns immediately, the runner
can reap the freshly spawned npm process before it fully detaches.

```bash
setsid nohup npm run dev -- --host 127.0.0.1 --port 5173 > .freebuff/preview-<thread-id>.log 2>&1 < /dev/null & echo "pid=$!"; disown; sleep 4
```

Confirm it survived and answers before registering:

```bash
ps -p <pid> -o pid,cmd
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/
```

The app is served at http://127.0.0.1:5173/.
