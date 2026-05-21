from pathlib import Path
path = Path('src/components/builder/PropertyPanel.tsx')
text = path.read_text(encoding='utf-8')
stack = []
pairs = {'(': ')', '[': ']', '{': '}'}
opening = set(pairs)
closing = {v: k for k, v in pairs.items()}
for i, ch in enumerate(text, 1):
    if ch in opening:
        stack.append((ch, i))
    elif ch in closing:
        if stack and stack[-1][0] == closing[ch]:
            stack.pop()
        else:
            print('Mismatch closing', ch, 'at', i, 'line', text.count('\n', 0, i) + 1)
            break
else:
    if stack:
        print('Unclosed', stack[-1][0], 'at', stack[-1][1], 'line', text.count('\n', 0, stack[-1][1]) + 1)
    else:
        print('All balanced')
