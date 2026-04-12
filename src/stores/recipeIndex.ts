// This File Loads index files into a Pinia Store
// to make them available reactively.

import { defineStore } from 'pinia'
import { useToastStore } from './toast'
import type { RecipeIndex, RecipeTypeIndex, ItemDetails, ItemId, RecipeType, Role, Recipe } from '../types'
import { calculateObjectSize, formatBytes } from '../utils/fileSize'
import { file } from '@babel/types';

export const useRecipeIndexStore = defineStore('recipeIndex', {
  state: () => ({
    loaded: false,
    typeIndex: null as RecipeTypeIndex | null,
    recipeIndex: null as RecipeIndex | null,
    items: null as ItemDetails[] | null,
    recipeCache: new Map<RecipeType, Recipe[]>(),
    iconCache: new Map<string, number>(),
  }),

    actions: {
        async load() {
            if (this.loaded) return; // Don't load again if already loaded

            try {
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
            } catch (error) {
                const toastStore = useToastStore()
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error('Failed to load recipe data', error)
                toastStore.error(`Failed to load recipe data: ${errorMessage}`)
            }
        },

        async loadRecipesForType(recipeType: RecipeType): Promise<Recipe[]> {
            // Check cache first
            if (this.recipeCache.has(recipeType)) {
                return this.recipeCache.get(recipeType)!
            }

            // Convert recipe type to filename (e.g., "minecraft:crafting" -> "minecraft_crafting")
            const fileName = recipeType.replace(':', '_')

            try {
                const module = await import(
                    `@/static/extracted-json/recipe_types/${fileName}.json`
                )
                const recipes = module.default
                this.recipeCache.set(recipeType, recipes)
                return recipes
            } catch (error) {
                const toastStore = useToastStore()
                console.error(`Failed to load recipes for type: ${recipeType}`, error)

                let errorMessage = 'Unknown error'
                if (error instanceof Error) {
                    errorMessage = error.message
                }

                // Handle specific error types
                if (error instanceof SyntaxError) {
                    // JSON Decode Error, malformed JSON
                    console.error(`Recipe data for ${recipeType} is invalid JSON, check ${fileName}.json`, error)
                    toastStore.error(`Recipe data for ${fileName}.json is malformed (invalid JSON)`)
                } else if (errorMessage.includes('Unknown variable dynamic import')) {
                    console.error(`Recipe file ${fileName}.json not found in static assets.`)
                    toastStore.error(`Recipe file not found: ${fileName}.json`)
                } else {
                    toastStore.error(`Error loading recipes for ${recipeType}: ${errorMessage}`)
                }
                return []
            }
        },

        registerIconSize(uid: string, size: number) {
            this.iconCache.set(uid, size)
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

        // Given ItemId, Role, and RecipeType, which recipe indices 
        // should load?
        recipeIndicesFor: (state) => {
            return (itemId: ItemId, role: Role, recipeType: RecipeType): number[] => {
                if (!state.recipeIndex) return []
                return state.recipeIndex[recipeType]?.[itemId]?.[role] ?? []
            }
        },

        // All item IDs from the items list — used to populate the sidebar
        allItemIds: (state): ItemId[] => {
            if (!state.items) return []
            return state.items.map(item => item.uid)
        },

        // Get item details by ID
        itemById: (state) => {
            return (itemId: ItemId): ItemDetails | undefined => {
                if (!state.items) return undefined
                return state.items.find(item => item.uid === itemId)
            }
        },

        // Get resourceLocation by uid (needed for recipe index lookups)
        resourceLocationByUid: (state) => {
            return (uid: string): string | undefined => {
                if (!state.items) return undefined
                return state.items.find(item => item.uid === uid)?.resourceLocation
            }
        },

        // Calculate total size of loaded JSON data and icons
        totalDataSize: (state) => {
            let totalBytes = 0
            if (state.typeIndex) totalBytes += calculateObjectSize(state.typeIndex)
            if (state.recipeIndex) totalBytes += calculateObjectSize(state.recipeIndex)
            if (state.items) totalBytes += calculateObjectSize(state.items)
            state.recipeCache.forEach(recipes => {
                totalBytes += calculateObjectSize(recipes)
            })
            state.iconCache.forEach(size => {
                totalBytes += size
            })
            return formatBytes(totalBytes)
        },

        // All recipe types available
        allRecipeTypes: (state): RecipeType[] => {
            if (!state.recipeIndex) return []
            return Object.keys(state.recipeIndex) as RecipeType[]
        }
    }
});