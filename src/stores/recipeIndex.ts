// This File Loads index files into a Pinia Store
// to make them available reactively.

import { defineStore } from 'pinia'
import type { RecipeIndex, RecipeTypeIndex, ItemDetails, ItemId, RecipeType, Role } from '../types'

export const useRecipeIndexStore = defineStore('recipeIndex', {
  state: () => ({
    loaded: false,
    typeIndex: null as RecipeTypeIndex | null,
    recipeIndex: null as RecipeIndex | null,
    items: null as ItemDetails[] | null,
  }),

    actions: {
        async load() {
            if (this.loaded) return; // Don't load again if already loaded

            // Load the JSON files
            const [typeIndex, recipeIndex, items] = await Promise.all([
                import('@/static/extracted-json/recipe_type_index.json'),
                import('@/static/extracted-json/recipe_index.json'),
                import('@/static/extracted-json/items.json'),
            ]);

            this.typeIndex = typeIndex.default
            this.recipeIndex = recipeIndex.default
            this.items = items.default
            this.loaded = true
        }
    },

    getters: {
         // Which recipe types does this item appear in for a given role?
        recipeTypesFor: (state) => {
            return (itemId: ItemId, role: Role): RecipeType[] => {
                if (!state.typeIndex) return []
                return state.typeIndex[itemId]?.[role] ?? []
            }
        },

        // Given RecipeType, ItemId, and Role, which recipe indices should load?
        recipeIndicesFor: (state) => {
        return (recipeType: RecipeType, itemId: ItemId, role: Role): number[] => {
            if (!state.recipeIndex) return []
            return state.recipeIndex[recipeType]?.[itemId]?.[role] ?? []
        }
        },

        // All item IDs from the items list — used to populate the sidebar
        allItemIds: (state): ItemId[] => {
            if (!state.items) return []
            return state.items.map(item => item.id)
        },

        // Get item details by ID
        itemById: (state) => {
            return (itemId: ItemId): ItemDetails | undefined => {
                if (!state.items) return undefined
                return state.items.find(item => item.id === itemId)
            }
        }
    }
});