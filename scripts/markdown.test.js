import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../src/markdown.js'

test('renders headings, lists, and safe links', () => {
  const html = renderMarkdown('# 标题\n\n一段 **重点**。\n\n- 甲\n- 乙\n\n[站](https://example.com)\n<script>alert(1)</script>')
  assert.match(html, /<h2>标题<\/h2>/)
  assert.match(html, /<strong>重点<\/strong>/)
  assert.match(html, /<li>甲<\/li>/)
  assert.match(html, /href="https:\/\/example.com"/)
  assert.ok(!html.includes('<script>'))
})

test('does not turn javascript urls into links', () => {
  const html = renderMarkdown('[x](javascript:alert(1))')
  assert.ok(!html.includes('<a '))
  assert.ok(!html.includes('<script>'))
})
