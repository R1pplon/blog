import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function countWords(md: string): number {
  if (!md) return 0
  let text = md

  text = text.replace(/```[\s\S]*?```/g, "")
  text = text.replace(/`[^`]*`/g, "")
  text = text.replace(/!\[.*?\]\(.*?\)/g, "")
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  text = text.replace(/<[^>]*>/g, "")
  text = text.replace(/^#{1,6}\s*/gm, "")
  text = text.replace(/\*{1,3}|_{1,3}|~~|~/g, "")
  text = text.replace(/^\s*[-*+]\s/gm, "")
  text = text.replace(/^\s*\d+\.\s/gm, "")
  text = text.replace(/^>\s*/gm, "")
  text = text.replace(/^[-*_]{3,}\s*$/gm, "")

  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length

  const nonChinese = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, " ").trim()
  const englishWords = nonChinese ? nonChinese.split(/\s+/).filter((w) => /\w/.test(w)).length : 0

  return chineseChars + englishWords
}

export function countPostWords(post: { filePath?: string; id: string }): number {
  try {
    const filePath = post.filePath || `src/content/blog/${post.id}.md`;
    const raw = readFileSync(resolve(filePath), "utf-8");
    return countWords(raw);
  } catch {
    return 0;
  }
}
