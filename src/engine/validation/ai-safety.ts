import type { ValidationIssue, ValidatorContext } from './types';

const VERY_UNLIKELY_BLOCK_TYPES = ['script', 'iframe', 'embed', 'object', 'applet', 'frame'];
const DANGEROUS_CONTENT_KEYS = ['innerHTML', 'dangerouslySetInnerHTML'];
const URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

function detectExcessiveNesting(blocks: unknown[], depth = 0): number {
  let maxDepth = depth;
  for (const block of blocks as Array<Record<string, unknown>>) {
    if (Array.isArray(block.children)) {
      const childDepth = detectExcessiveNesting(block.children, depth + 1);
      if (childDepth > maxDepth) maxDepth = childDepth;
    }
  }
  return maxDepth;
}

export function validateAISafety(context: ValidatorContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const blocks = context.blocks as Array<Record<string, unknown>>;

  if (!Array.isArray(blocks)) return issues;

  for (const block of blocks as Array<Record<string, unknown>>) {
    const blockId = block.id as string | undefined;
    const blockType = block.type as string | undefined;

    if (blockType && VERY_UNLIKELY_BLOCK_TYPES.includes(blockType)) {
      issues.push({
        code: 'AI_SAFETY_UNLIKELY_BLOCK_TYPE',
        severity: 'warning',
        message: `AI generated block type "${blockType}" which may be unsafe in the builder context`,
        blockId,
      });
    }

    const content = (block.content || block.props || {}) as Record<string, unknown>;
    for (const key of DANGEROUS_CONTENT_KEYS) {
      if (content[key] !== undefined) {
        issues.push({
          code: 'AI_SAFETY_DANGEROUS_CONTENT',
          severity: 'warning',
          message: `AI generated block uses "${key}" which can lead to XSS vulnerabilities`,
          path: `content.${key}`,
          blockId,
        });
      }
    }

    if (blockType === 'html' || blockType === 'code') {
      const htmlContent = (content.html || content.code || '') as string;
      if (typeof htmlContent === 'string' && htmlContent.length > 0) {
        issues.push({
          code: 'AI_SAFETY_RAW_HTML',
          severity: 'info',
          message: `AI generated raw ${blockType} content — review for malicious scripts before publishing`,
          blockId,
        });
      }
    }

    if (blockType === 'image' || blockType === 'video') {
      const src = (content.src || '') as string;
      if (typeof src === 'string' && src.length > 0) {
        const hasValidProtocol = URL_PROTOCOLS.some(p => src.startsWith(p));
        const hasBlockedProtocol = BLOCKED_PROTOCOLS.some(p => src.startsWith(p));

        if (hasBlockedProtocol) {
          issues.push({
            code: 'AI_SAFETY_BLOCKED_PROTOCOL',
            severity: 'error',
            message: `AI generated src with blocked protocol in "${blockType}" block`,
            path: 'content.src',
            blockId,
          });
        } else if (!hasValidProtocol && !src.startsWith('/')) {
          issues.push({
            code: 'AI_SAFETY_INVALID_URL',
            severity: 'warning',
            message: `AI generated src may be an invalid URL in "${blockType}" block`,
            path: 'content.src',
            blockId,
          });
        }
      }
    }

    if (blockType === 'button') {
      const href = (content.href || '') as string;
      if (typeof href === 'string') {
        const hasBlocked = BLOCKED_PROTOCOLS.some(p => href.startsWith(p));
        if (hasBlocked) {
          issues.push({
            code: 'AI_SAFETY_BLOCKED_HREF',
            severity: 'error',
            message: 'AI generated button href with blocked protocol (javascript:)',
            path: 'content.href',
            blockId,
          });
        }
      }
    }
  }

  const maxDepth = detectExcessiveNesting(blocks);
  if (maxDepth > 6) {
    issues.push({
      code: 'AI_SAFETY_EXCESSIVE_NESTING',
      severity: 'warning',
      message: `AI generated block tree depth of ${maxDepth} levels — consider simplifying`,
    });
  }

  return issues;
}
