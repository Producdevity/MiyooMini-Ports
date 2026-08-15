# MiyooMini-Ports

Game ports for the Miyoo Mini, Mini Plus, and Mini Flip that aren't in
[OnionUI/Ports-Collection](https://github.com/OnionUI/Ports-Collection). That
collection stopped updating in May 2024. This list covers what's landed since.

Live site: <https://producedevity.github.io/MiyooMini-Ports/>

<!-- BEGIN PORTS -->

| Port | Category | Status | Assets |
| --- | --- | --- | --- |
[crisp-game-lib](https://github.com/joyrider3774/crisp-game-lib-portable-sdl) | Arcade | Source only | Free
[joyrider3774 games](https://github.com/joyrider3774/miyoo_mini_games/releases) | Arcade | Playable | Free
[FreeJ2ME](https://github.com/aweigit/freej2me-miyoomini/releases) | Engine | Playable | Owned data
[ONScripter-jh](https://github.com/weimingtom/onscripter-jh-miyoo-mini-plus) | Engine | Source only | Owned data
[Half-Life](https://github.com/IC-0n417/half-life-miyoo-mini-plus/releases) | FPS | Prerelease | Owned data
[Quake II](https://github.com/Apaczer/quake2-miyoo/releases) | FPS | Playable | Owned data
[SuperTux](https://github.com/andrigamerita/supertux/releases) | Platform | Playable | Free
[Frozen Bubble](https://github.com/mehdisadeghi/frozen-bubble-onion/releases) | Puzzle | Playable | Free
[Elasto Mania](https://github.com/neri-rnd/elma-miyoo/releases) | Racing | Playable | Owned data
[Super Haxagon](https://github.com/RedTopper/Super-Haxagon/releases) | Reflex | Playable | Free
[Stardew Valley](https://github.com/Producdevity/stardew-valley-miyoo-mini-port/releases) | RPG | Experimental | Owned data
[Undertale](https://github.com/cobaltgit/Butterscotch/releases) | RPG | Playable | Owned data
[POSTAL](https://github.com/bostrt/POSTAL-miyoo/releases) | Shooter | Experimental | Owned data
[OpenRCT2](https://github.com/scheeseman486/OpenRCT2mini/releases) | Simulation | Playable | Owned data

<!-- END PORTS -->

## Devices

The Miyoo Mini (v1–v4), Mini Plus, and Mini Flip share one board family:
SigmaStar SSD202D, ARMv7-A hard-float + NEON, 128 MB RAM. One build runs on
all three.

The Mini Flip is the SigmaStar clamshell. The Miyoo Flip (Rockchip RK3566)
and the Miyoo A30 (Allwinner A33) are different hardware and are not
supported by these ports.

## Install a port

Download the release, copy its `Roms/` folder to your SD card, then run
`~Import ports` in Onion's Ports list. Ports that need owned game data stay
hidden until you add that data.

## Develop

```sh
pnpm install
pnpm dev          # vite dev server
pnpm build        # vite build
pnpm typecheck    # tsc (app + scripts)
pnpm check        # biome lint + format
pnpm format       # biome autofix
pnpm validate     # ports.json against the schema
pnpm gen:readme   # regenerate the table above
```

Node 22, pnpm 11.

## Project layout

| Path | Purpose |
| --- | --- |
| `ports.json` | catalog data |
| `ports.schema.json` | JSON schema for ports.json |
| `index.html` | page shell |
| `style.css` | styles |
| `src/` | the site (types, schema, filter, render, main) |
| `scripts/` | gen-readme, validate-ports |
| `biome.json` | formatter and linter |
| `.husky/pre-commit` | formats staged files, regenerates the table when ports.json changes |

## Contributing

To add or update a port, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Deploy

Pushes to `master` build and publish to GitHub Pages via
`.github/workflows/ci.yml`. Set Settings → Pages → Source to **GitHub
Actions** and the default branch to `master`.
