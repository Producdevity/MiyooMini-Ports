# MiyooMini-Ports

A browsable, searchable catalog of native game ports for the Miyoo Mini family
that aren't in [OnionUI/Ports-Collection](https://github.com/OnionUI/Ports-Collection).

Onion's Ports-Collection hasn't been updated since May 2024, but the Mini has
kept getting new ports. This collects the ones that landed since, or never made
it in.

**→ Live site: <https://producedevity.github.io/MiyooMini-Ports/>**

## Devices covered

Miyoo Mini (v1–v4), Mini Plus, and Mini Flip. All three run the same SigmaStar
SSD202D, ARMv7-A hard-float + NEON, on the OnionOS/Mini userland, so a port
that works on one works on all of them. Miyoo confirmed the Mini Flip reuses
the Mini v4 board.

Not covered: **Miyoo Flip** (Rockchip RK3566, aarch64, uses PortMaster) and
**Miyoo A30** (Allwinner A33). Different devices.

## How the catalog works

Each entry links to the port's own `/releases` page. Most releases drop a
`Roms/` folder on your SD card; run `~Import ports` in Onion's Ports list and
they appear. Ports that need owned data stay hidden (`*.notfound`) until that
data is present.

The list below is generated from `ports.json`. For search and filters, use the
[live site](https://producedevity.github.io/MiyooMini-Ports/).

<!-- BEGIN PORTS -->

| Port | Category | Status | Assets |
| --- | --- | --- | --- |
[crisp-game-lib](https://github.com/joyrider3774/crisp-game-lib-portable-sdl) | Arcade | source only | free
[joyrider3774 games](https://github.com/joyrider3774/miyoo_mini_games/releases) | Arcade | playable | free
[FreeJ2ME](https://github.com/aweigit/freej2me-miyoomini/releases) | Engine | playable | owned data
[ONScripter-jh](https://github.com/weimingtom/onscripter-jh-miyoo-mini-plus) | Engine | source only | owned data
[Half-Life](https://github.com/IC-0n417/half-life-miyoo-mini-plus/releases) | FPS | prerelease | owned data
[Quake II](https://github.com/Apaczer/quake2-miyoo/releases) | FPS | playable | owned data
[SuperTux](https://github.com/andrigamerita/supertux/releases) | Platform | playable | free
[Frozen Bubble](https://github.com/mehdisadeghi/frozen-bubble-onion/releases) | Puzzle | playable | free
[Elasto Mania](https://github.com/neri-rnd/elma-miyoo/releases) | Racing | playable | owned data
[Super Haxagon](https://github.com/RedTopper/Super-Haxagon/releases) | Reflex | playable | free
[Stardew Valley](https://github.com/Producdevity/stardew-valley-miyoo-mini-port/releases) | RPG | experimental | owned data
[Undertale](https://github.com/cobaltgit/Butterscotch/releases/tag/onion-port) | RPG | playable | free
[POSTAL](https://github.com/bostrt/POSTAL-miyoo/releases) | Shooter | experimental | owned data
[OpenRCT2](https://github.com/scheeseman486/OpenRCT2mini/releases) | Simulation | playable | owned data

<!-- END PORTS -->

## Develop

```sh
pnpm install
pnpm dev        # vite dev server with HMR
pnpm build      # tsc typecheck + vite build -> dist/
pnpm preview    # serve the built dist/
pnpm check      # biome lint + format check
pnpm format     # biome autofix
```

Node 22+, pnpm 11+. Biome formats and lints on commit via a husky pre-commit
hook + lint-staged, scoped to staged files.

## Structure

```
ports.json              the catalog data
index.html              page shell (header, search bar, empty <main>, footer)
style.css               all styling
src/types.ts            Port / Status / Assets types, filter value lists
src/schema.ts           parses + validates ports.json into typed Port[]
src/filter.ts           matches() and filterPorts(), pure, no DOM
src/render.ts           DOM rendering: rows, chips, group labels
src/main.ts             entry: imports ports.json, holds state, wires events
scripts/gen-readme.ts   generates this README's port table from ports.json
biome.json              formatter + linter config
.lintstagedrc.json      what lint-staged runs on staged files
.husky/pre-commit       runs lint-staged before each commit
```

## Contributing

To add or update a port, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with
pnpm and publishes `dist/` to GitHub Pages.

GitHub repo settings needed once: Settings → Pages → Source = **GitHub Actions**.
Settings → Default branch = `master`.
