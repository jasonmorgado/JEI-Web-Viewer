export type Role = "INPUT" | "OUTPUT";
export type ItemId = string;
export type RecipeType = string; // "minecraft:crafting"
export type RecipeClass = string; // "ShapedRecipe"

// items.json is a list of ItemDetails
export interface ItemDetails {
  uid: ItemId;
  resourceLocation: string;
  name: string;
  mod: string;
}

export interface ItemStack {
  uid: ItemId;
  resourceLocation: string;
  damage: number;
  item: string;
  capNBT: Record<string, any>;
  maxDamage: number;
  name: string;
  count: number;
  tag: Record<string, any>;
}

export interface FluidStack {
  [key: string]: any;
}

export interface Slot {
  role: Role;
  x: number;
  y: number;
  items: ItemStack[]; // List of possible ItemStacks for this slot, like different wood types for a chest.
  fluids: FluidStack[];
}

export interface Recipe extends Record<string, any> {
  slots: Slot[];
  _type: string; // Class name like "AnvilRecipe" or "ShapedRecipe"
}

export type RecipeTypeIndex = Record<ItemId, Partial<Record<Role, RecipeType[]>>>;
/*
{
  "minecraft:bamboo": { // Item ID
    "INPUT": [ // Role
      "minecraft:crafting", // Recipe Type ID
    ]
  },
  ...
}
*/

export type RecipeIndex = Record<RecipeType, Record<ItemId, Partial<Record<Role, number[]>>>>;
/*
{
  "minecraft:anvil": { // RecipeType
    "minecraft:wooden_sword": { // ItemID
      "INPUT": [ // Role
        0, // Index of recipe in list of recipes
        1,
      ],
*/


