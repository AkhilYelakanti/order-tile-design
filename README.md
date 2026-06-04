# Order Tile Designer

A visual editor for **Order Tile** configurations. Lay out a tile on a grid,
mark label/value cells, set CSS and calculated formulas, and generate the
`ORDER_TILE_HDR` / `ORDER_TILE_DTL` insert script — or
import an existing script and edit it visually.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Requires Node 18+.

## Features

- **Grid editor** — drag to draw regions, click to select, Alt-click a cell to flip
  it between label (`NAME_POS_ID`) and value (`VALUE_POS_ID`).
- **Inspector** — edit `ATTR_NAME`, `ATTR_VALUE` (with field autocomplete),
  `ATTR_VALUE_TYPE`, `NAME_CSS`, `VALUE_CSS`, `SOURCE`. Selecting `CALCULATED`
  reveals an `ATTR_MATH` field (e.g. `DLVD_COST = CALCULATED(AD_EFFECTIVE*QTY_ENTRY)`).
- **Position encodings** — `{row}-{col}` (default), `row*100+col`, legacy
  `row*10+col`, sequential, or zero-padded. The generated SQL updates live.
- **Live SQL** — full HDR + DTL inserts, column-major block ordering, copy / download.
- **Round-trip import** — paste or upload an existing tile script; the encoding is
  auto-detected and the layout reconstructed for editing.
- **Validation** — coverage, gaps, overlaps, and CALCULATED-without-formula checks.
- **Tile preview** — approximate render using the configured CSS and sample data.
- **Multiple projects** — manage several tile formats; autosaved to `localStorage`.
- **Undo/redo** (Ctrl+Z / Ctrl+Y) and **light/dark theme**.

## Project layout

```
src/
  App.jsx                 orchestration + editing operations
  constants.js            field catalog, default header, 11×12 preset
  hooks/useHistory.js     undo/redo
  lib/
    positions.js          encode / decode / detect encoding
    sqlGenerator.js       build HDR + DTL inserts
    sqlParser.js          parse an existing script back into a layout
    validation.js         coverage / overlap / issue checks
    storage.js            localStorage + file download
  components/             Header, ProjectBar, Toolbar, GridEditor, Inspector,
                          RegionList, SqlPanel, TilePreview, ValidationPanel, ImportDialog
```

## Notes / next steps

- The position **encoding** is the contract with the Android renderer's parse
  logic — keep both sides consistent. `{row}-{col}` is recommended (self-delimiting,
  unambiguous at any grid size).
- A natural backend extension: have a Spring Boot service persist the exported JSON
  and write directly to the HDR/DTL tables via a DAO, removing the manual SQL step
  and enabling read-back of existing formats into the editor.
- Confirm domain specifics before production use: the `ITEM_FILE` value keys for
  `LOQ`, and the operands in the `DLVD_COST` formula.
