import type { KeyboardEvent } from 'react'
import { CollectionMenu } from '../CollectionMenu'
import { OverflowMenu } from '../OverflowMenu'
import type { RowModel } from './types'
import { t } from '../../lib/locale'

const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

/** Commit on Enter, abandon on Escape — the convention for every inline field here. */
function inlineFieldKeys(commit: () => void, cancel: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }
}

export function RowPlayButton({
  row,
  size,
}: {
  row: RowModel
  size: 'sm' | 'md'
}) {
  const { props, isCurrent, isPlaying, isLoading, onPlayPause } = row
  return (
    <button
      type="button"
      aria-label={
        isPlaying ? t(`Pause ${props.sound.name}`, `${props.sound.name} を一時停止`) : t(`Play ${props.sound.name}`, `${props.sound.name} を再生`)
      }
      onMouseDown={stop}
      onClick={onPlayPause}
      className={[
        'grid shrink-0 place-items-center rounded-full border',
        size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-7 w-7 text-[11px]',
        isCurrent
          ? 'border-accent-2 text-accent-2-text'
          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
      ].join(' ')}
    >
      {isLoading ? '…' : isPlaying ? '❚❚' : '▶'}
    </button>
  )
}

/** The Sound's name, swapped for a rename field while the user is editing it. */
export function RowName({ row, className }: { row: RowModel; className: string }) {
  const {
    props,
    renaming,
    renameDraft,
    setRenameDraft,
    commitRename,
    cancelRename,
    customName,
    isEdit,
    displayName,
  } = row

  if (renaming) {
    return (
      <input
        type="text"
        autoFocus
        value={renameDraft}
        onMouseDown={stop}
        onChange={(e) => setRenameDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={inlineFieldKeys(commitRename, cancelRename)}
        placeholder={t('blank = Freesound name', '空欄ならFreesoundの名前')}
        className="min-w-0 flex-1 rounded border border-focus bg-surface px-1.5 py-0.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
    )
  }

  return (
    <span
      className={className}
      title={
        customName && !isEdit
          ? `${customName}  (Freesound: ${props.sound.name})`
          : props.sound.name
      }
    >
      {displayName}
    </span>
  )
}

/**
 * The user's own tags. Read-only chips until the row enters tag-edit mode, at
 * which point each chip removes itself and a field appends new ones.
 */
export function RowTags({
  row,
  inputWidth,
}: {
  row: RowModel
  inputWidth: string
}) {
  const {
    customTags,
    editingTags,
    setEditingTags,
    addingTag,
    tagDraft,
    setTagDraft,
    startAddTag,
    commitAddTag,
    cancelAddTag,
    onRemoveTag,
  } = row

  if (!editingTags) {
    if (customTags.length === 0) return null
    return (
      <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {customTags.map((tag) => (
          <span
            key={`c:${tag}`}
            className="inline-flex shrink-0 items-center rounded border border-ok px-1 text-[10px] text-ok"
            title={t('Your tag — edit from the ⋯ menu', '自分のタグ。⋯メニューから編集')}
          >
            # {tag}
          </span>
        ))}
      </span>
    )
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
      {customTags.map((tag) => (
        <button
          key={`c:${tag}`}
          type="button"
          onMouseDown={stop}
          onClick={() => onRemoveTag(tag)}
          className="inline-flex shrink-0 items-center gap-0.5 rounded border border-ok px-1 text-[10px] text-ok hover:bg-surface-raised"
          title={t('Your tag — click to remove', '自分のタグ。クリックで削除')}
        >
          <span># {tag}</span>
          <span aria-hidden>×</span>
        </button>
      ))}
      {addingTag ? (
        <input
          type="text"
          autoFocus
          value={tagDraft}
          onMouseDown={stop}
          onChange={(e) => setTagDraft(e.target.value)}
          onBlur={commitAddTag}
          onKeyDown={inlineFieldKeys(commitAddTag, cancelAddTag)}
          placeholder={t('tag + Enter', 'タグ + Enter')}
          className={`${inputWidth} shrink-0 rounded border border-focus bg-surface px-1 text-[10px] text-ink placeholder:text-ink-faint focus:outline-none`}
        />
      ) : (
        <button
          type="button"
          onMouseDown={stop}
          onClick={startAddTag}
          className="shrink-0 rounded border border-line px-1 text-[10px] text-ink-muted hover:border-line-strong hover:text-ink"
          title={t('Add your own tag', '自分のタグを追加')}
        >
          {t('+ tag', '+ タグ')}
        </button>
      )}
      <button
        type="button"
        onMouseDown={stop}
        onClick={() => {
          cancelAddTag()
          setEditingTags(false)
        }}
        className="shrink-0 rounded border border-line px-1 text-[10px] text-ink-muted hover:border-line-strong hover:text-ink"
        title={t('Done editing tags', 'タグ編集を終了')}
      >
        {t('✓ done', '✓ 完了')}
      </button>
    </span>
  )
}

/**
 * The per-row `⋯`. `CollectionMenu` is mounted invisibly alongside it and driven
 * programmatically for the "Add to collection" nested step.
 */
export function RowMenu({ row }: { row: RowModel }) {
  const { menuItems, overflowKey, displayName, pickerHostRef, onPickCollection } =
    row
  return (
    <div className="relative flex shrink-0 items-center">
      <OverflowMenu
        key={overflowKey}
        label={t(`More actions for ${displayName}`, `${displayName} のその他の操作`)}
        title={t('More actions', 'その他の操作')}
        items={menuItems}
      />
      <span
        ref={pickerHostRef}
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 opacity-0"
      >
        <CollectionMenu
          label=""
          onPick={onPickCollection}
          title={t('Add this sound to a collection', 'この音をコレクションに追加')}
          className="block h-0 w-0 overflow-hidden p-0"
        />
      </span>
    </div>
  )
}
