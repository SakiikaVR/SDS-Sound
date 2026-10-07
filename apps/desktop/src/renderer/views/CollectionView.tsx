import { AddToCollectionBar } from '../components/AddToCollectionBar'
import { ResultList } from '../components/ResultList'
import type { UseCollectionView } from '../hooks/useCollectionView'
import { useViewport } from '../lib/viewport'
import { t } from '../lib/locale'
import type { CollectionSummary, Sound } from '../../core/types'

export interface CollectionViewProps {
  openCollection: CollectionSummary
  collection: UseCollectionView
  resultCountText: string | null
  onFocusSearch: () => void
  onRemove: (sound: Sound) => void
  onEdit: (sound: Sound) => void
}

export function CollectionView({
  openCollection,
  collection,
  resultCountText,
  onFocusSearch,
  onRemove,
  onEdit,
}: CollectionViewProps) {
  const { isRail } = useViewport()

  return (
    <div className="flex h-full flex-col">
      <AddToCollectionBar />

      {collection.status === 'error' && (
        <p className="p-4 text-sm text-error" role="alert">
          {t('Could not read this collection.', 'コレクションを読み込めませんでした。')}
        </p>
      )}

      {collection.status === 'ok' && collection.sounds.length === 0 && (
        <div className="p-4 text-sm text-ink-muted">
          <p className="font-medium text-ink-muted">
            {t(`“${openCollection.name}” has no sounds yet.`, `「${openCollection.name}」にはまだ音がありません。`)}
          </p>
          <p className="mt-1">
            {t('Add sounds from your Library — tick rows, then “Add to collection”.', 'ライブラリで音を選択し、「コレクションに追加」を押してください。')}
          </p>
        </div>
      )}

      {collection.sounds.length > 0 && (
        <div className="min-h-0 flex-1">
          <ResultList
            sounds={collection.sounds}
            hasMore={false}
            loadingMore={false}
            loadMore={() => {}}
            onFocusSearch={onFocusSearch}
            variant="collection"
            onRemove={onRemove}
            removeLabel={t('Remove from collection', 'コレクションから削除')}
            removeTitle={t('Remove from this collection — the sound stays in your Library', 'コレクションから削除します。音はライブラリに残ります。')}
            onEdit={onEdit}
            topSlot={isRail ? resultCountText : undefined}
          />
        </div>
      )}
    </div>
  )
}
