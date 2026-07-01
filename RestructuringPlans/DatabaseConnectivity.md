# Database connectivity: home wifi vs institutional networks

## Root cause

Two independent things were found, both under "can't connect to the DB":

1. **`.env` doesn't currently exist** in the project (checked `./` and `backend/` —
   neither has one). Gitignored files don't travel with a clone, so if this is a fresh
   checkout or the file was lost, `DATABASE_URL` is `undefined` and `pg.Pool` silently
   tries `localhost:5432` instead of Supabase. No amount of network fixing helps until
   this file exists again with a real connection string.
2. **Supabase's direct-connection hostname (`db.<ref>.supabase.co:5432`) is IPv6-only**
   in most regions. Testing this machine: it has a global IPv6 address assigned, but
   outbound IPv6 to the wider internet times out (`curl -6` to a known-good IPv6 host
   failed; IPv4 succeeded). That's a half-broken home-router/ISP IPv6 setup, not a
   firewall rule on port 5432 specifically.

## Options, and whether they carry over to an institutional network

Institutional networks (campus/office) commonly add a *third* failure mode on top of
IPv6 breakage: outbound firewalls that block database ports by number, regardless of
protocol correctness.

| Option | What changes | Fixes home-wifi IPv6 issue | Fixes institutional port-blocking |
|---|---|---|---|
| **Transaction pooler** — `aws-0-<region>.pooler.supabase.com:6543` | Host + port | Yes (IPv4 host) | Likely — 6543 isn't the well-known DB port most firewalls target |
| **Session pooler** — `aws-0-<region>.pooler.supabase.com:5432` | Host only, same port | Yes (IPv4 host) | No — still port 5432, blocked by any firewall filtering that port outright |
| **Supabase IPv4 add-on** (paid) | Nothing in your code/env | Yes | No — same reasoning as session pooler |
| **Fix IPv6 at the router/ISP** | Network config, not app | Yes | N/A — you don't control institutional network infra |
| **VPN / mobile hotspot** | Bypasses the network entirely | Yes | Yes, if the VPN tunnels over 443 — but check the institution's acceptable-use policy first, some prohibit VPN use on their network |

## Recommendation

- Default to the **transaction pooler (port 6543)** in `.env` — it's a same-project,
  no-cost change and is the only option that survives both failure modes (IPv6 breakage
  *and* port-based blocking) without extra tooling.
- If 6543 is *also* blocked (some strict networks block all non-web outbound ports),
  fall back to a mobile hotspot for that session rather than fighting the firewall.
- `backend/src/db.ts` now has `connectionTimeoutMillis: 10000` and a `pool.on('error', ...)`
  logger (see commit `b1e5d08`), so whichever of the above is wrong will fail within 10s
  with a message in the server log, instead of hanging.
