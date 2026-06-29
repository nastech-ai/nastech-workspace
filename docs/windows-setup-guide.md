# Windows Setup Guide — NasTech Workspace

Last updated: 2026-05-28

## Architecture

Three services, three config files:

| Service | Port | Config file |
|---|---|---|
| NasTech Agent Gateway | 8642 | `C:\Users\<you>\AppData\Local\nastech\.env` |
| NasTech CLI tools | — | `C:\Users\<you>\.nastech\.env` |
| Workspace Dashboard | 3000 | `C:\Users\<you>\nastech-workspace\.env` |

## Required .env contents

### `AppData\Local\nastech\.env` (gateway)
```
OPENROUTER_API_KEY=<your-key>
OPENROUTER_API_KEY_1=<your-key-2>
OPENROUTER_API_KEY_2=<your-key-3>
API_SERVER_ENABLED=true
API_SERVER_HOST=0.0.0.0
API_SERVER_KEY=<generate-a-random-hex-string>
```

### `~/.nastech\.env` (CLI tools)
Same as above — same keys, same API_SERVER_KEY.

### `nastech-workspace\.env` (dashboard)
```
OPENROUTER_API_KEY=<your-key>
NASTECH_API_URL=http://127.0.0.1:8642
NASTECH_DASHBOARD_URL=http://127.0.0.1:9119
NASTECH_API_TOKEN=<must-match-API_SERVER_KEY-above>
PORT=3000
HOST=127.0.0.1
```

**Critical:** `NASTECH_API_TOKEN` must equal `API_SERVER_KEY` exactly.

## Prerequisites (Windows)

```powershell
# 1. sqlite3 CLI (for kanban/tasks)
winget install SQLite.SQLite --accept-package-agreements --accept-source-agreements
# Then copy sqlite3.exe to a Git Bash PATH dir:
# Source: C:\Users\<you>\AppData\Local\Microsoft\WinGet\Packages\SQLite.SQLite_...\sqlite3.exe
# Dest:   C:\Users\<you>\bin\sqlite3.exe

# 2. Claude CLI (for Claude Tasks / Conductor)
npm install -g @anthropic-ai/claude-code

# 3. pnpm (if not installed)
npm install -g pnpm
```

## Start sequence

```bash
# Terminal 1 — Gateway
nastech gateway run

# Wait for: "Uvicorn running on http://127.0.0.1:8642"

# Terminal 2 — Dashboard
cd C:\Users\<you>\nastech-workspace
pnpm dev

# Open http://127.0.0.1:3000
```

## Port conflict resolution

```powershell
# Find what's holding a port
netstat -ano | findstr :8642
netstat -ano | findstr :3000

# Kill it
Stop-Process -Id <PID> -Force
```

## PWA Install

1. Open `http://127.0.0.1:3000` in Chrome or Edge
2. Click install icon (⊕) in address bar
3. Gets own window + taskbar icon

**Note:** PWA only works while `pnpm dev` is running.

## Common errors

| Error | Fix |
|---|---|
| `API_SERVER_KEY is required` | Add `API_SERVER_KEY=<value>` to `AppData\Local\nastech\.env` |
| `spawnSync sqlite3 ENOENT` | Install sqlite3 via winget, copy exe to PATH |
| `which: no claude in` | `npm install -g @anthropic-ai/claude-code` |
| `Port 3000 already in use` | Kill stale process via `netstat -ano` + `Stop-Process` |
| `Slack invalid_auth` | Expected if Slack not configured — ignore |
| Dashboard shows "not available on this backend" | Gateway API server not running or NASTECH_API_TOKEN mismatch |

## File locations reference

| What | Path |
|---|---|
| Gateway env | `C:\Users\<you>\AppData\Local\nastech\.env` |
| CLI env | `C:\Users\<you>\.nastech\.env` |
| Workspace env | `C:\Users\<you>\nastech-workspace\.env` |
| Kanban DB | `C:\Users\<you>\AppData\Local\nastech\kanban.db` |
| Gateway code | `C:\Users\<you>\AppData\Local\nastech\nastech-agent\` |
| Workspace code | `C:\Users\<you>\nastech-workspace\` |
| Custom skills | `C:\Users\<you>\AppData\Local\nastech\skills\` |
| NasTech config | `C:\Users\<you>\.nastech\config.yaml` |
