# Contributing

All port data lives in `ports.json`. The README table and the live site both
build from it, so don't edit the README table by hand. To add or update a port,
edit `ports.json` and open a PR.

## Adding a port

Append an object to the array in `ports.json`:

```json
{
  "name": "Stardew Valley",
  "category": "RPG",
  "status": "experimental",
  "assets": "owned",
  "upstream": "https://github.com/.../releases",
  "image": "https://...",
  "notes": "Setup gotchas and caveats."
}
```

### Fields

| Field | Required | Value |
| --- | --- | --- |
| `name` | yes | Display name. |
| `category` | yes | Genre. Free-form, but reuse an existing one if it fits. |
| `status` | yes | `playable` \| `experimental` \| `prerelease` \| `source only` |
| `assets` | yes | `free` (nothing to supply) \| `owned` (user supplies game data) |
| `upstream` | yes | Link the `/releases` page, not a pinned version, so this never goes stale. If the port has no releases, link the repo root. |
| `notes` | yes | Setup gotchas, device caveats, what to supply. Keep it short. |
| `image` | no | Stable screenshot URL (GitHub user-attachments URLs work). Omit if there's no good screenshot. |

### Status values

- **playable** — runs well, with any caveats noted in `notes`
- **experimental** — runs but rough (low FPS, crashes, untested on some devices)
- **prerelease** — the upstream author labels it pre-release
- **source only** — no binary, the user builds it

## Rules

- Don't list ports already in [OnionUI/Ports-Collection](https://github.com/OnionUI/Ports-Collection)
  or Onion's Package Manager (OpenBOR, PICO-8/fake-08, ScummVM).
- Link out, don't host. No binaries or game data in this repo; point at the
  port's own releases.
- Link `/releases`, not a pinned version, unless the port has no releases.
- If you have a screenshot, use a stable URL. GitHub user-attachment URLs
  (`https://github.com/user-attachments/assets/<id>`) are permanent.

## Local checks

```sh
pnpm install
pnpm check     # biome lint + format
pnpm build     # tsc typecheck + vite build
```

The pre-commit hook runs Biome on staged files and regenerates the README table
when `ports.json` is staged. If you edit `ports.json` from the GitHub web UI,
CI will fail if the README table is out of sync. Run `pnpm gen:readme` locally
and commit the result.

## Scope

Miyoo Mini, Mini Plus, and Mini Flip (SigmaStar SSD202D, ARMv7-A hf + NEON).
The Miyoo Flip (Rockchip RK3566) and Miyoo A30 (Allwinner A33) are different
devices; their ports don't belong here.
