import { useCallback } from 'react'
import { useCollections } from '../store/useCollections'
import { useMultiSelect } from '../store/useMultiSelect'
import { CollectionMenu } from './CollectionMenu'
import { t } from '../lib/locale'

export function AddToCollectionBar() {
  const checked = useMultiSelect((s) => s.checked)
  const clear = useMultiSelect((s) => s.clear)
  const count = checked.size

  const onPick = useCallback(
    (collectionId: number) => {
      const ids = [...useMultiSelect.getState().checked]
      if (ids.length === 0) return
      void useCollections.getState().addSounds(collectionId, ids)
      clear()
    },
    [clear],
  )

  if (count === 0) return null

  return (
    <div className="flex items-center gap-3 border-b border-line bg-surface-raised px-4 py-1.5 text-xs text-ink-muted">
      <span className="tabular-nums">
        {t(`${count} ${count === 1 ? 'sound' : 'sounds'} selected`, `${count} 件選択中`)}
      </span>
      <CollectionMenu
        label={t('Add to collection ▾', 'コレクションに追加 ▾')}
        onPick={onPick}
        title={t('Add the selected sounds to a collection', '選択した音をコレクションに追加')}
      />
      <button
        type="button"
        onClick={clear}
        className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-line-strong hover:text-ink"
      >
        {t('Clear selection', '選択を解除')}
      </button>
    </div>
  )
}
