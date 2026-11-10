# ⚡ TANVEER STAFF MONITOR

A Discord.js + TypeScript foundation for privacy-conscious staff/ticket monitoring. Permanent identity and the one Global Owner ID are immutable source constants (`src/config/branding.ts`). This project never issues warnings automatically: issuance is only possible through the reviewed domain service and its default Global Owner gate.

## Current implementation
- Persistent SQLite schema and WAL mode, per-guild records, audit/event deduplication, feature storage, owner/admin records, review and warning tables.
- Owner ID guard, server owner synchronization on bot join/start, role-ID roster setup and roster scan; these use actual Discord IDs and roles.
- Observable ticket response ingestion only for ticket channels explicitly registered in `ticket_records`. No hidden third-party button interactions are claimed. Message content is not stored; only event/message IDs and metadata are retained. Message Content privileged intent is not enabled.
- Coverage-aware inactivity classification (24h at-risk, 48h inactive review, 72h escalation), approved leave protection input, and unknown/error states.
- Persistent owner-review schema and resumable state; configured emoji IDs are validated and use Unicode fallbacks.

The operational core includes interval scans, explicit channel registration, custom persistent review buttons, owner/reviewer notifications, a final approval confirmation with current role/activity revalidation, leave records, paginated staff embeds, branded CSV/PNG exports, and automated rolling SQLite snapshots. It does not claim compatibility with hidden third-party ticket actions: assignments, claims, ticket lifecycle updates, categories/threads, and each ticket vendor require an explicit observable adapter/event integration. Unknown coverage is never treated as verified inactivity.

## Setup
1. Node.js 20.11+. `npm install` then copy `.env.example` to `.env` and fill `DISCORD_TOKEN`, `CLIENT_ID`; never overwrite an existing `.env`.
2. In the Discord Developer Portal enable **Server Members Intent** for complete role roster synchronization. Do not enable Presence intent. Message Content is off by default; if you require the implemented text-length meaningful-response filter, set `MESSAGE_CONTENT_INTENT=true` and enable the privileged intent in the Developer Portal. Otherwise only attachment-bearing messages qualify as observed responses.
3. Invite with `bot` + `applications.commands`, and permissions limited to View Channels, Read Message History, Send Messages, Embed Links and access to configured ticket channels/threads. Use persistent storage for `DATABASE_PATH`.
4. `npm run register` registers commands globally, or set `DEV_GUILD_ID` for development. `npm run build && npm start`.
5. `/staff setup role:<role>` is server-owner-only. `/staff scan` syncs the complete role roster, runs a coverage-aware scan, and presents a paginated roster. A six-hour scan runs by default (`SCAN_INTERVAL_HOURS` controls cadence). It intentionally reports coverage unknown until ticket monitoring has been genuinely set up.

## Ticket adapter boundary
A ticket is counted only after an accessible channel is explicitly inserted into `ticket_records` by an operator/trusted adapter. Observed non-bot staff messages with at least 12 non-whitespace characters or attachments are recorded as response metadata. Claim/assignment/resolve events must be integrated through a real ticket product webhook or bot event adapter; hidden interactions cannot be observed. Do not insert inaccessible channels or fabricate history.

## Emoji assets
`src/config/emojis.ts` is the manifest. Unicode fallback is static and reliable; Unicode emojis do not animate. Supply only actual custom emoji IDs you control. Animated custom emojis require Discord-supported uploaded GIF assets and permissions; retain PNG/static fallbacks. No copied emotes are bundled. `assets/` is reserved for original banner assets.

## Operations and safety
Database directory must be persistent and backed up. Create consistent backups with SQLite's backup API or stop the process and copy the database plus WAL files; do not copy only a live `.sqlite` file. Restrict filesystem access and `.env` permissions. Logs omit message bodies. Graceful SIGINT/SIGTERM closes the DB. Simulation/testing must use a separate database and never connect to Discord.

### Pterodactyl
Use Node.js 20+, install command `npm ci`, startup `npm start`, persistent `/home/container/data` volume and `DATABASE_PATH=/home/container/data/staff-monitor.sqlite`. Configure restart-on-crash and monitor process logs. Keep secrets in panel environment variables.

## Tests
`npm test` runs pure domain/security tests without a Discord connection. `npm run build` checks compilation. This is not a guarantee of successful Discord delivery; DM failures and permissions must be handled operationally by a future delivery adapter.
