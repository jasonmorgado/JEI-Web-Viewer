// This File Loads index files into a Pinia Store
// to make them available reactively.

import { defineStore } from 'pinia'
import { useToastStore } from './toast'
import type { RecipeIndex, RecipeTypeIndex, ItemsDict, ItemId, RecipeType, Role, Recipe } from '../types'
import { calculateObjectSize, formatBytes } from '../utils/fileSize'

/**
 * Resolve an itemId to its effective UID by checking the fallback map.
 * If the itemId is not directly in the typeIndex, derive its resourceLocation
 * from the UID format (e.g., "minecraft__painting" → "minecraft:painting")
 * and look up the fallback map for the canonical hashed UID.
 */
function resolveItemId(itemId: ItemId, typeIndex: RecipeTypeIndex | null, fallbackMap: Record<string, string> | null): ItemId {
  if (typeIndex?.[itemId]) return itemId

  if (!fallbackMap) return itemId

  const parts = itemId.split('__')
  if (parts.length >= 2) {
    const resourceLocation = parts[0] + ':' + parts[1]
    const fallbackUid = fallbackMap[resourceLocation]
    if (fallbackUid) return fallbackUid
  }

  return itemId
}

export const useRecipeIndexStore = defineStore('recipeIndex', {
  state: () => ({
    loaded: false,
    typeIndex: null as RecipeTypeIndex | null,
    recipeIndex: null as RecipeIndex | null,
    items: null as ItemsDict | null,
    fallbackMap: null as Record<string, string> | null,
    recipeCache: new Map<RecipeType, Recipe[]>(),
    iconCache: new Map<string, number>(),
  }),

    actions: {
        async load() {
            if (this.loaded) return; // Don't load again if already loaded

            try {
                // Load the JSON files
                const [typeIndex, recipeIndex, items, fallbackJson] = await Promise.all([
                    import('@/static/extracted-json/recipe_type_index.json'),
                    import('@/static/extracted-json/recipe_index.json'),
                    import('@/static/extracted-json/items.json'),
                    import('@/static/extracted-json/fallback_resource_id_to_uid.json'),
                ]);

                this.typeIndex = typeIndex.default
                this.recipeIndex = recipeIndex.default
                this.items = items.default as ItemsDict
                this.fallbackMap = fallbackJson.default as Record<string, string>
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
        },

        /**
         * Resolve an item UID to its fallback UID using the fallback map.
         * Derives the resourceLocation from the UID format
         * (e.g., "minecraft__lingering_potion" → "minecraft:lingering_potion")
         * and looks up the canonical hashed UID.
         * Returns the original itemId if no fallback is found.
         */
        getFallbackUid(itemId: ItemId): ItemId {
            if (!this.fallbackMap) return itemId

            const parts = itemId.split('__')
            if (parts.length >= 2) {
                const resourceLocation = parts[0] + ':' + parts[1]
                const fallbackUid = this.fallbackMap[resourceLocation]
                if (fallbackUid) return fallbackUid
            }

            return itemId
        }
    },

    getters: {
         // Which recipe types does this item appear in for a given role?
        recipeTypesFor: (state) => {
            return (itemId: ItemId, role: Role): RecipeType[] => {
                if (!state.typeIndex) return []
                const resolvedId = resolveItemId(itemId, state.typeIndex, state.fallbackMap)
                return state.typeIndex[resolvedId]?.[role] ?? []
            }
        },

        // Given ItemId, Role, and RecipeType, which recipe indices 
        // should load?
        recipeIndicesFor: (state) => {
            return (itemId: ItemId, role: Role, recipeType: RecipeType): number[] => {
                if (!state.recipeIndex) return []
                const resolvedId = resolveItemId(itemId, state.typeIndex, state.fallbackMap)
                return state.recipeIndex[recipeType]?.[resolvedId]?.[role] ?? []
            }
        },

        // All item IDs from the items list — used to populate the sidebar
        allItemIds: (state): ItemId[] => {
            if (!state.items) return []
            return Object.keys(state.items)
        },

        // Get item details by ID
        itemById: (state) => {
            return (itemId: ItemId): ItemsDict[ItemId] | undefined => {
                if (!state.items) return undefined
                return state.items[itemId]
            }
        },

        // Get resourceLocation by uid (needed for recipe index lookups)
        resourceLocationByUid: (state) => {
            return (uid: string): string | undefined => {
                if (!state.items) return undefined
                return state.items?.[uid]?.resourceLocation
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