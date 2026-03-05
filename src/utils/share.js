export async function copyBookmarkLink(bookmark, toast, t) {
  const text = `${bookmark.title}\n${bookmark.url}`
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t('toast.linkCopied'))
  } catch {
    toast.error(t('toast.copyFailed'))
  }
}
