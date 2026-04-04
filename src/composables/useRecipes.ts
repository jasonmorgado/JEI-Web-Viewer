import { computed, type Ref } from 'vue'
import { useRecipeIndexStore } from '@/stores/recipeIndex'
import type { Role, RecipeType, ItemId, Recipe } from '@/types.ts'

export function useRecipes(itemId: Ref<ItemId | null>, role: Ref<Role | null>) {
  const store = useRecipeIndexStore()

  // Which recipe types are available for this item + role?
  const availableTypes = computed<RecipeType[]>(() => {
    if (!itemId.value || !role.value) return []
    return store.recipeTypesFor(itemId.value, role.value)
  })

  // Load actual recipes for a given type
  async function fetchRecipes(type: RecipeType): Promise<Recipe[]> {
    if (!itemId.value || !role.value) {
        console.log(`Item ID ${itemId.value} or role ${role.value} not set, cannot fetch recipes`)
        return []
    }
    const indices = store.recipeIndicesFor(itemId.value, role.value, type)
    if (indices.length === 0) return []

    const filename = type.replace('minecraft:', 'minecraft_')
    const file = await import(`@/static/extracted-json/recipe_types/${filename}.json`)

    return indices.map((i: number) => file.default[i])
  }

  return { availableTypes, fetchRecipes }
}