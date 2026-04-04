import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useRecipes } from './useRecipes'
import { useRecipeIndexStore } from '@/stores/recipeIndex'
import type { Role } from '@/types'


describe('useRecipes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('availableTypes', () => {
    it('returns empty array when itemId is null', () => {
      const itemId = ref<string | null>(null)
      const role = ref<Role | null>('INPUT')
      const store = useRecipeIndexStore()
      store.typeIndex = {
        'minecraft:charcoal': {
          'INPUT': ['minecraft:crafting', 'minecraft:fuel']
        }
      }

      const { availableTypes } = useRecipes(itemId, role)

      expect(availableTypes.value).toEqual([])
    })

    it('returns empty array when role is null', () => {
      const itemId = ref<string | null>('minecraft:charcoal')
      const role = ref<Role | null>(null)
      const store = useRecipeIndexStore()
      store.typeIndex = {
        'minecraft:charcoal': {
          'INPUT': ['minecraft:crafting', 'minecraft:fuel']
        }
      }

      const { availableTypes } = useRecipes(itemId, role)

      expect(availableTypes.value).toEqual([])
    })

    it('returns recipe types for given item and role', () => {
      const itemId = ref<string | null>('minecraft:charcoal')
      const role = ref<Role | null>('INPUT')
      const store = useRecipeIndexStore()
      store.typeIndex = {
        'minecraft:charcoal': {
          'INPUT': ['minecraft:crafting', 'minecraft:fuel'],
          'OUTPUT': ['minecraft:furnace']
        }
      }

      const { availableTypes } = useRecipes(itemId, role)

      expect(availableTypes.value).toEqual(['minecraft:crafting', 'minecraft:fuel'])
    })

    it('updates when itemId changes', () => {
      const itemId = ref<string | null>('minecraft:charcoal')
      const role = ref<Role | null>('INPUT')
      const store = useRecipeIndexStore()
      store.typeIndex = {
        'minecraft:charcoal': {
          'INPUT': ['minecraft:crafting']
        },
        'minecraft:stone': {
          'INPUT': ['minecraft:smelting']
        }
      }

      const { availableTypes } = useRecipes(itemId, role)

      expect(availableTypes.value).toEqual(['minecraft:crafting'])

      itemId.value = 'minecraft:stone'

      expect(availableTypes.value).toEqual(['minecraft:smelting'])
    })
  })

  describe('fetchRecipes', () => {
    it('returns empty array when itemId is null', async () => {
      const itemId = ref<string | null>(null)
      const role = ref<Role | null>('INPUT')

      const { fetchRecipes } = useRecipes(itemId, role)

      const result = await fetchRecipes('minecraft:crafting')

      expect(result).toEqual([])
    })

    it('returns empty array when role is null', async () => {
      const itemId = ref<string | null>('minecraft:charcoal')
      const role = ref<Role | null>(null)

      const { fetchRecipes } = useRecipes(itemId, role)

      const result = await fetchRecipes('minecraft:crafting')

      expect(result).toEqual([])
    })

    it('returns empty array when recipe indices are empty', async () => {
      const itemId = ref<string | null>('minecraft:charcoal')
      const role = ref<Role | null>('INPUT')
      const store = useRecipeIndexStore()
      store.recipeIndex = {
        'minecraft:crafting': {
          'minecraft:charcoal': {
            'INPUT': []
          }
        }
      }

      const { fetchRecipes } = useRecipes(itemId, role)

      const result = await fetchRecipes('minecraft:crafting')

      expect(result).toEqual([])
    })

  })
})
