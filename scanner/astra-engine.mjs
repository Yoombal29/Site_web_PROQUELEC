
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generator from '@babel/generator';

const traverse = _traverse.default;
const generate = _generator.default;

/**
 * 🚀 PROQUELEC ULTRA-AI : CORTEX ENGINE V3.2 "ENTERPRISE READY"
 * Finalisation après audit expert V3.1.
 */

export class AstraEngine {
    constructor(options = {}) {
        this.issues = [];
        this.fixes = 0;
        this.isRepairMode = options.isRepairMode || false;
    }

    getTagName(node) {
        if (!node) return '';
        if (node.type === 'JSXIdentifier') return node.name;
        if (node.type === 'JSXMemberExpression') {
            const obj = this.getTagName(node.object);
            const prop = node.property?.name || '';
            return obj ? `${obj}.${prop}` : prop;
        }
        return '';
    }

    getAttributeValue(attr) {
        if (!attr) return null;
        if (!attr.value) return 'BOOLEAN_TRUE';

        if (attr.value.type === 'StringLiteral') return attr.value.value;
        if (attr.value.type === 'JSXExpressionContainer') {
            const expr = attr.value.expression;
            if (expr.type === 'StringLiteral') return expr.value;
            if (expr.type === 'TemplateLiteral') return 'DYNAMIC_TEMPLATE';
            return 'DYNAMIC_EXPRESSION';
        }
        return 'UNKNOWN';
    }

    analyze(filePath, content) {
        this.issues = [];
        this.fixes = 0;

        let ast;
        try {
            ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties']
            });
        } catch (e) {
            return { error: `Parsing failed: ${e.message}`, modified: false };
        }

        let modified = false;
        const currentIssues = [];

        traverse(ast, {
            JSXOpeningElement: (p) => {
                const tagName = this.getTagName(p.node.name);
                if (!tagName) return;

                const isNative = /^[a-z]/.test(tagName);

                // Boutons : Audit #4 - Détection renforcée des enfants (JSXText ou Expression)
                if (isNative && tagName === 'button') {
                    const hasLabel = p.node.attributes.some(attr => ['aria-label', 'title'].includes(attr.name?.name));
                    const children = p.parentPath?.node?.children || [];
                    const hasContent = children.some(c =>
                        (c.type === 'JSXText' && c.value.trim().length > 0) ||
                        (c.type === 'JSXExpressionContainer') ||
                        (c.type === 'JSXElement')
                    );

                    if (!hasLabel && !hasContent) {
                        currentIssues.push({ type: 'VULN', msg: `Bouton icon-only sans label (Accessibilité)` });
                        if (this.isRepairMode) {
                            p.node.attributes.push({
                                type: 'JSXAttribute',
                                name: { type: 'JSXIdentifier', name: 'aria-label' },
                                value: { type: 'StringLiteral', value: 'Action' }
                            });
                            modified = true;
                            this.fixes++;
                        }
                    }
                }

                // Images
                if (tagName === 'img') {
                    const hasAlt = p.node.attributes.some(attr => attr.name?.name === 'alt');
                    if (!hasAlt) {
                        currentIssues.push({ type: 'VULN', msg: `Image sans alt` });
                        if (this.isRepairMode) {
                            p.node.attributes.push({ type: 'JSXAttribute', name: { type: 'JSXIdentifier', name: 'alt' }, value: { type: 'StringLiteral', value: 'Image' } });
                            modified = true; this.fixes++;
                        }
                    }
                }
            },

            // Audit #3: Suppression console.log sécurisée (syntax-safe)
            CallExpression: (p) => {
                const callee = p.node.callee;
                if (callee.type === 'MemberExpression') {
                    const isConsole = (callee.object?.type === 'Identifier' && callee.object.name === 'console') ||
                        (callee.object?.type === 'MemberExpression' && callee.object.object?.name === 'window' && callee.object.property?.name === 'console');

                    if (isConsole && ['log', 'debug', 'info'].includes(callee.property?.name)) {
                        currentIssues.push({ type: 'OPTIM', msg: `Debug log résiduel` });
                        if (this.isRepairMode) {
                            // On supprime proprement le statement parent pour éviter de casser les if/loops
                            if (p.parentPath.isExpressionStatement()) {
                                p.parentPath.remove();
                            } else {
                                p.remove();
                            }
                            modified = true;
                            this.fixes++;
                        }
                    }
                }
            },

            // Audit #2: Protection 'import type' TypeScript
            ImportDeclaration: (p) => {
                if (p.node.importKind === 'type') return;

                const specifiers = p.get('specifiers');
                const toRemove = [];

                specifiers.forEach((specPath) => {
                    const name = specPath.node.local?.name;
                    if (!name || name === 'React') return;

                    const binding = p.scope.getBinding(name);
                    if (binding && !binding.referenced && binding.referencePaths.length === 0) {
                        currentIssues.push({ type: 'OPTIM', msg: `Import inutilisé : ${name}` });
                        if (this.isRepairMode) toRemove.push(specPath);
                    }
                });

                if (this.isRepairMode && toRemove.length > 0) {
                    toRemove.forEach(s => s.remove());
                    if (p.node.specifiers.length === 0) p.remove();
                    modified = true;
                }
            }
        });

        this.issues = currentIssues;
        return { modified, code: modified ? generate(ast, { retainLines: true }, content).code : null, issues: currentIssues };
    }
}
