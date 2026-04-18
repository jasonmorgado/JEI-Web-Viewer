# JEI Web Viewer

This repo is the frontend for a project designed to display Minecraft recipes extracted from the Just Enough Items (JEI) mod.

The backend is a mod that extracts a set of JSON files from JEI on runtime, which gets copied into this repo. See the backend mod [here](https://github.com/jasonmorgado/JEI-Extractor).

You can take a look at the working frontend on GitHub Pages! (TODO LINK)

## Highlights

- Displays an item list on the right hand side, allowing users to look up crafting recipes per item
- Displays Recipes organized by RecipeType (Crafting, Furnace, etc)
- Supports Icons extracted from [IconExporter](https://www.curseforge.com/minecraft/mc-mods/iconexporter)
  - Some recipes with NBT data not found in the creative menu won't currently display icons. Such as damaged or enchanted items.
- Dynamically loads JSON files and icons as-needed to reduce initial load time

## TODO (For UI)

- [ ] Load icons ahead of time (currently loads as you scroll)
- [ ] Test against modded recipes
- [ ] Sort recipe lists in extractor (currently random order every export)
- [ ] Paginate Recipe list.
- [ ] Establish standards for File transfer amounts
  - [ ] And display it somewhere in UI, per JSON file.
  - [ ] Optimize JSON schema for this, a lot of duplication here.
- [ ] Research extracting backgrounds and positioning slots with x,y coords.

## Development

Run `npm run dev` to run the site locally.

Loading different recipe JSON currently requires sticking them in src/static/extracted-json/
With the two index files in this folder, and the rest going into the recipe_types subfolder.

The JSON is checked into the repo to allow deploying to GitHub pages.
