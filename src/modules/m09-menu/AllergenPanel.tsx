import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { QUERY_KEYS } from '@/lib/queries'
import type { MenuItem } from '@/types/menu'

const ALL_ALLERGENS = [
  'Celery', 'Cereals/Gluten', 'Crustaceans', 'Eggs', 'Fish',
  'Lupin', 'Milk', 'Molluscs', 'Mustard', 'Tree Nuts', 'Peanuts',
  'Sesame', 'Soya', 'Sulphur Dioxide',
]

interface Props {
  item: MenuItem
}

export function AllergenPanel({ item }: Props) {
  const qc = useQueryClient()

  const existingMap = Object.fromEntries(
    (item.menu_item_allergens ?? []).map((a) => [a.allergen_name, a])
  )

  const toggle = useMutation({
    mutationFn: async ({ allergen, field }: { allergen: string; field: 'present' | 'may_contain' }) => {
      const existing = existingMap[allergen]
      if (existing) {
        const update = { ...existing, [field]: !existing[field] }
        if (!update.present && !update.may_contain) {
          const { error } = await supabase.from('menu_item_allergens').delete().eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('menu_item_allergens').update({ [field]: !existing[field] }).eq('id', existing.id)
          if (error) throw error
        }
      } else {
        const { error } = await supabase.from('menu_item_allergens').insert({
          menu_item_id: item.id,
          allergen_name: allergen,
          present: field === 'present',
          may_contain: field === 'may_contain',
        })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.menuItems }),
  })

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {ALL_ALLERGENS.map((allergen) => {
          const entry = existingMap[allergen]
          return (
            <div key={allergen} className="flex items-center justify-between p-2 rounded-lg bg-surface">
              <span className="font-body text-sm text-dark">{allergen}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle.mutate({ allergen, field: 'present' })}
                  className={`px-2 py-0.5 rounded text-xs font-body border transition-colors ${
                    entry?.present
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'bg-white border-border text-muted hover:border-red-200'
                  }`}
                >
                  Contains
                </button>
                <button
                  onClick={() => toggle.mutate({ allergen, field: 'may_contain' })}
                  className={`px-2 py-0.5 rounded text-xs font-body border transition-colors ${
                    entry?.may_contain
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-white border-border text-muted hover:border-amber-200'
                  }`}
                >
                  May Contain
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <p className="font-body text-xs text-muted">Click to toggle allergen presence. Changes save immediately.</p>
    </div>
  )
}
