# GRANDMASTER OS — PRIVACY & DATA SOVEREIGNTY CHARTER

## 1. Core Commitment: Total Local Sovereignty

**Grandmaster OS is built on a single uncompromising premise: your chess training is entirely private, offline, and confidential.**

The software functions as an air-gapped chess laboratory on your local Windows PC.

```
                   +---------------------------------------+
                   |           YOUR WINDOWS PC             |
                   |                                       |
                   |   +-------------------------------+   |
                   |   |        GRANDMASTER OS         |   |
                   |   |                               |   |
                   |   |  - Local Chess Engine         |   |
                   |   |  - Local SQLite Database      |   |
                   |   |  - Local Coaching Expert      |   |
                   |   |  - Local Opening Encyclopedia |   |
                   |   |  - Local Puzzles & Lessons    |   |
                   |   +---------------+---------------+   |
                   |                   |                   |
                   |   +---------------v---------------+   |
                   |   |  %APPDATA%/GrandmasterOS/     |   |
                   |   |  (100% on your local disk)    |   |
                   |   +-------------------------------+   |
                   +-------------------|-------------------+
                                       |
                                       X  NO NETWORK ACCESS
                                       |  (Blocked by CSP & Sandbox)
                                       v
                             [ THE PUBLIC INTERNET ]
```

---

## 2. Non-Negotiable Privacy Principles

1. **Zero External Accounts**: There is no "Sign Up", "Log In", or cloud sync. Your username is simply a local profile tag.
2. **Zero Telemetry or Analytics**: No Google Analytics, PostHog, Mixpanel, Sentry, or pingbacks.
3. **Zero Remote AI Services**: The Grandmaster Coach runs 100% locally via deterministic chess heuristic evaluation and local Stockfish analysis. No prompts, positions, or game logs are ever transmitted to OpenAI, Google, Anthropic, or any third party.
4. **Zero Remote CDNs**: All fonts, styling, icons, scripts, and chess piece SVGs are bundled locally in the application package.
5. **No Hidden Background Uploads**: The application has no background update daemons or periodic polling tasks.

---

## 3. Local Data Storage & File Locations

All application data is stored in standard local application directories:

- **Database**: `%APPDATA%\GrandmasterOS\grandmaster.db` (or user-chosen directory)
- **Local Settings**: `%APPDATA%\GrandmasterOS\settings.json`
- **Saved PGNs**: `%USERPROFILE%\Documents\GrandmasterOS\Games\` (or user-exported files)

You have full ownership of these files. You can copy, backup, or delete them at any time without asking permission from anyone.

---

## 4. Network Security & Content Security Policy (CSP)

Grandmaster OS enforces a strict Content Security Policy in its desktop shell:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';
```

- Any attempt by any component or dependency to initiate an HTTP request (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`) to an external IP or domain is blocked immediately by the browser engine.
- Automated tests include a network spy test verifying that no outbound requests are triggered during standard operations (playing games, analyzing positions, completing lessons, running tactics).

---

## 5. Third-Party Licenses & Transparency

Grandmaster OS utilizes only open-source, permissively licensed, or GPL-compliant offline software:
- **Stockfish**: Licensed under the GNU General Public License v3 (GPLv3).
- **chess.js**: Licensed under the MIT License.
- **Lucide Icons**: Licensed under the ISC License.
- **Tailwind CSS & React**: Licensed under the MIT License.
- Complete license texts and source code references are bundled and viewable via `Settings -> About & Licenses`.
