# JEI Display

Displays extracted JEI data from the JEI Extractor.

TODO
- Look into differenciating Potions in the itemlist
  - Problem: namespace:item_id not unique, need NBT related hash in the unique ID to properly handle it. Like JEI.
    - TODO investigate in Extractor. 
    - Also pass this on root-level for Recipe's ingredients.
- Test against modded recipes
- Look into extracting item icons
- Research extracting backgrounds and positioning slots with x,y coords.
- Paginate Recipe list.
