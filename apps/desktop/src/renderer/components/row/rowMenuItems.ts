import type { Sound } from '../../../core/types'
import type { OverflowMenuItem } from '../OverflowMenu'
import type { StagingStatus } from '../../store/useStaging'
import type { RowVariant } from './types'
import { t } from '../../lib/locale'

export interface RowMenuParams {
  sound: Sound
  variant: RowVariant
  isRail: boolean
  inLibrary: boolean
  checked: boolean
  stagingStatus: StagingStatus
  removeLabel?: string
  onEdit?: (sound: Sound) => void
  onRemove?: (sound: Sound) => void
  onDownload: () => void
  onDeleteFromLibrary: () => void
  onOpenFreesoundPage: () => void
  onRevealInFinder: () => void
  onStartRename: () => void
  onEditTags: () => void
  onToggleChecked: () => void
  onAddToCollection: () => void
  onFindSimilar?: () => void
}

/**
 * The `⋯` menu for one row. The rail layout folds in every action that the wide
 * layout shows as its own visible control, so nothing becomes unreachable when
 * the window narrows.
 */
export function buildRowMenuItems(p: RowMenuParams): OverflowMenuItem[] {
  const isLibraryVariant = p.variant === 'library' || p.variant === 'collection'

  const addToCollection: OverflowMenuItem = {
    label: t('Add to collection', 'コレクションに追加'),
    opensNestedPicker: true,
    disabled: !(isLibraryVariant || p.inLibrary),
    onSelect: p.onAddToCollection,
  }
  const openPage: OverflowMenuItem = {
    label: t('Open Freesound page', 'Freesoundのページを開く'),
    onSelect: p.onOpenFreesoundPage,
  }
  const similar: OverflowMenuItem | null = p.sound.id > 0 && p.onFindSimilar
    ? { label: t('Find similar sounds', '似た音を探す'), onSelect: p.onFindSimilar }
    : null
  const licenceDetail: OverflowMenuItem = {
    label: t(`Licence · ${p.sound.license.name}`, `ライセンス · ${p.sound.license.name}`),
    disabled: true,
    onSelect: () => {},
  }
  const selectToggle: OverflowMenuItem = {
    label: p.checked ? t('Deselect', '選択を解除') : t('Select', '選択'),
    onSelect: p.onToggleChecked,
  }

  if (p.variant === 'search') {
    if (!p.isRail) return [openPage, ...(similar ? [similar] : []), addToCollection]
    const removeOrGet: OverflowMenuItem = p.inLibrary
      ? {
          label: p.removeLabel ?? t('Remove from Library', 'ライブラリから削除'),
          destructive: true,
          onSelect: p.onDeleteFromLibrary,
        }
      : { label: t('⬇ Download', '⬇ ダウンロード'), onSelect: p.onDownload }
    return [removeOrGet, addToCollection, ...(similar ? [similar] : []), openPage, licenceDetail]
  }

  const common: OverflowMenuItem[] = [
    addToCollection,
    { label: t('Edit tags', 'タグを編集'), onSelect: p.onEditTags },
    { label: t('Rename', '名前を変更'), onSelect: p.onStartRename },
    { label: t('Reveal in Finder', 'ファイルの場所を開く'), onSelect: p.onRevealInFinder },
    openPage,
    ...(similar ? [similar] : []),
  ]
  const editAction: OverflowMenuItem = {
    label: t('✂ Edit', '✂ 編集'),
    disabled: p.stagingStatus !== 'ready',
    onSelect: () => p.onEdit?.(p.sound),
  }
  const remove: OverflowMenuItem = {
    label:
      p.removeLabel ??
      (p.variant === 'collection'
        ? t('Remove from collection', 'コレクションから削除')
        : t('Remove from Library', 'ライブラリから削除')),
    destructive: true,
    onSelect: () => p.onRemove?.(p.sound),
  }

  if (!p.isRail) {
    return p.variant === 'collection' ? common : [...common, remove]
  }

  const items: OverflowMenuItem[] = []
  if (p.onEdit) items.push(editAction)
  items.push(remove, ...common, licenceDetail, selectToggle)
  return items
}
