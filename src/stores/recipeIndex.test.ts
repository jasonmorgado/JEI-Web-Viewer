import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecipeIndexStore } from './recipeIndex'
import { useToastStore } from './toast'
import type { RecipeIndex, RecipeTypeIndex } from '../types'

const mockTypeIndex: RecipeTypeIndex = {
  "minecraft:charcoal": {
    "INPUT": ["minecraft:crafting", "minecraft:fuel"],
    "OUTPUT": ["minecraft:furnace"]
  },
}

const mockRecipeIndex: RecipeIndex = {
  "minecraft:crafting": {
    "minecraft:charcoal": {
      "INPUT": [0, 1],
      "OUTPUT": [2]
    }
  },
  "minecraft:fuel": {
    "minecraft:charcoal": {
      "INPUT": [3]
    }
  },
  "minecraft:furnace": {
    "minecraft:charcoal": {
      "OUTPUT": [4]
    }
  }
}

const mockItems = [
  { id: "minecraft:charcoal", name: "Charcoal", mod: "Minecraft" },
  { id: "minecraft:stone", name: "Stone", mod: "Minecraft" },
]

describe('useRecipeIndexStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('recipeTypesFor getter', () => {
    it('returns recipe types for charcoal INPUT', () => {
      const store = useRecipeIndexStore()
      store.typeIndex = mockTypeIndex

      const result = store.recipeTypesFor('minecraft:charcoal', 'INPUT')

      expect(result).toEqual(['minecraft:crafting', 'minecraft:fuel'])
    })

    it('returns recipe types for charcoal OUTPUT', () => {
      const store = useRecipeIndexStore()
      store.typeIndex = mockTypeIndex

      const result = store.recipeTypesFor('minecraft:charcoal', 'OUTPUT')

      expect(result).toEqual(['minecraft:furnace'])
    })
  })

  describe('recipeIndicesFor getter', () => {
    it('returns recipe indices for charcoal INPUT in crafting', () => {
      const store = useRecipeIndexStore()
      store.recipeIndex = mockRecipeIndex

      const result = store.recipeIndicesFor('minecraft:charcoal', 'INPUT', 'minecraft:crafting')

      expect(result).toEqual([0, 1])
    })

    it('returns recipe indices for charcoal INPUT in fuel', () => {
      const store = useRecipeIndexStore()
      store.recipeIndex = mockRecipeIndex

      const result = store.recipeIndicesFor('minecraft:charcoal', 'INPUT', 'minecraft:fuel')

      expect(result).toEqual([3])
    })

    it('returns recipe indices for charcoal OUTPUT in furnace', () => {
      const store = useRecipeIndexStore()
      store.recipeIndex = mockRecipeIndex

      const result = store.recipeIndicesFor('minecraft:charcoal', 'OUTPUT', 'minecraft:furnace')

      expect(result).toEqual([4])
    })
  })

  describe('allItemIds getter', () => {
    it('returns all item IDs from items list', () => {
      const store = useRecipeIndexStore()
      store.items = mockItems

      const result = store.allItemIds

      expect(result).toEqual(['minecraft:charcoal', 'minecraft:stone'])
    })
  })

  describe('itemById getter', () => {
    it('returns item details by ID', () => {
      const store = useRecipeIndexStore()
      store.items = mockItems

      const result = store.itemById('minecraft:charcoal')

      expect(result).toEqual({ id: 'minecraft:charcoal', name: 'Charcoal', mod: 'Minecraft' })
    })

    it('returns undefined for non-existent item', () => {
      const store = useRecipeIndexStore()
      store.items = mockItems

      const result = store.itemById('non:existent')

      expect(result).toBeUndefined()
    })
  })

  describe('loadRecipesForType error handling', () => {
    it('handles file not found error', async () => {
      const store = useRecipeIndexStore()
      const toastStore = useToastStore()
      const toastErrorSpy = vi.spyOn(toastStore, 'error')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock the import to throw unknown variable dynamic import error
      vi.doMock(
        '@/static/extracted-json/recipe_types/minecraft_missing.json',
        () => {
          throw new Error('Unknown variable dynamic import')
        }
      )

      const result = await store.loadRecipesForType('minecraft:missing')

      expect(result).toEqual([])
      expect(toastErrorSpy).toHaveBeenCalledWith('Recipe file not found: minecraft_missing.json')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load recipes for type: minecraft:missing',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
      vi.unmock('@/static/extracted-json/recipe_types/minecraft_missing.json')
    });
  })
})
