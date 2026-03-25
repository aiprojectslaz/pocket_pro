// src/utils/textToBlocks.js
// Converts plain textarea text → Strapi blocks array (same format used in DB).
// Lines starting with • - − are treated as bullet list items.
// Everything else becomes a paragraph block.

export function textToBlocks(text) {
  if (!text) return []
  const str = String(text).trim()
  if (!str || str === 'N/A') return []

  const lines   = str.split('\n')
  const blocks  = []
  let   bullets = []

  function flushBullets() {
    if (!bullets.length) return
    blocks.push({
      type:     'list',
      format:   'unordered',
      children: bullets.map(t => ({
        type:     'list-item',
        children: [{ type: 'text', text: t }],
      })),
    })
    bullets = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (/^[•\-−]/.test(line)) {
      bullets.push(line.replace(/^[•\-−]\s*/, '').trim())
    } else {
      flushBullets()
      blocks.push({ type: 'paragraph', children: [{ type: 'text', text: line }] })
    }
  }
  flushBullets()
  return blocks
}

// Converts blocks array back to plain text for editing in a textarea.
export function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      return block.children?.map(c => c.text).join('') || ''
    }
    if (block.type === 'list') {
      return (block.children || [])
        .map(item => '• ' + (item.children?.map(c => c.text).join('') || ''))
        .join('\n')
    }
    if (block.type === 'heading') {
      return block.children?.map(c => c.text).join('') || ''
    }
    return ''
  }).filter(Boolean).join('\n')
}
