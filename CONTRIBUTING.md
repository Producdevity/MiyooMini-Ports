# Contributing

Edit `ports.json` and open a PR. The README table and the live site both build
from it; the table regenerates on commit, so leave it alone.

## Adding a port

Append an object to the `ports` array:

```json
{
  "name": "Stardew Valley",
  "category": "RPG",
  "status": "experimental",
  "assets": "owned",
  "upstream": "https://github.com/.../releases",
  "image": "https://...",
  "notes": "Short setup notes for the user."
}
```

### Fields

| Field | Required | Value |
| --- | --- | --- |
| `name` | yes | Display name. |
| `category` | yes | One of: `Arcade`, `Engine`, `FPS`, `Platform`, `Puzzle`, `Racing`, `Reflex`, `RPG`, `Shooter`, `Simulation`. Add a new value to `src/types.ts` and `ports.schema.json` only if none of these fit. |
| `status` | yes | `playable`, `experimental`, `prerelease`, or `source only` (see below). |
| `assets` | yes | `free` if nothing is required, `owned` if the user supplies game data. |
| `upstream` | yes | The `/releases` page. Use the repo root only if there are no releases. Don't link a specific tag. |
| `notes` | yes | What to supply, device caveats, performance. Keep it short. |
| `image` | no | Stable screenshot URL. GitHub user-attachment URLs work. |

### Status values

- `playable` — runs well
- `experimental` — runs, but rough (low FPS, crashes, untested hardware)
- `prerelease` — labeled pre-release upstream
- `source only` — no binary, built by the user

## Rules

- No ports that are already in [OnionUI/Ports-Collection](https://github.com/OnionUI/Ports-Collection)
  or Onion's Package Manager (OpenBOR, PICO-8/fake-08, ScummVM).
- Link to upstream releases. Don't commit binaries or game data.
- Screenshot URLs must be stable. GitHub user-attachment URLs
  (`https://github.com/user-attachments/assets/<id>`) are permanent.

## Local checks

```sh
pnpm install
pnpm check      # biome lint + format
pnpm build      # vite build
pnpm validate   # ports.json against the schema
```

The pre-commit hook formats staged files and regenerates the README table when
`ports.json` is staged. Web edits skip the hook, so a web-only PR may fail CI
on a stale table. Run `pnpm gen:readme` and push, or ask a maintainer to.

## Scope

Miyoo Mini, Mini Plus, Mini Flip (SigmaStar SSD202D). The Miyoo Flip (RK3566)
and Miyoo A30 (A33) are different hardware and don't belong in this collection.
