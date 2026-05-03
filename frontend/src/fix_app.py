import re
import sys

with open('/root/gastroprime/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Fix className=word -> className="word"
content = re.sub(
    r'className=([a-zA-Z][a-zA-Z0-9_\-]*)',
    r'className="\1"',
    content
)

# Fix alt=Word -> alt="Word"
content = re.sub(
    r'alt=([a-zA-Z][a-zA-Z0-9_\-]*)',
    r'alt="\1"',
    content
)

with open('/root/gastroprime/frontend/src/App.tsx', 'w') as f:
    f.write(content)

print('Fixed')
