# Run doc — adamportfolio

Vite + React dev server (npm).

## Reproduce artifacts

No env files are required. Install dependencies once:

```bash
npm install
```

This creates `node_modules/` (and refreshes `package-lock.json` if needed).

## Run the server

Start the dev server on port 5173, detached:

```bash
setsid nohup npm run dev -- --host 127.0.0.1 --port 5173 > .freebuff/preview-fbaf6aef-53d6-4bf8-b973-716251628820.log 2>&1 < /dev/null & echo "pid=$!"; disown
```

The app is served at http://127.0.0.1:5173/. Bind explicitly to IPv4 loopback so the thread Preview tab can reach it.
