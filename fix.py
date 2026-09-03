import glob
import os
import re

for f in glob.glob("backend/tests/test_*.py"):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix the syntax error: we have `raise e}")` because of the bad regex replacement.
    # So we can just replace `raise e}")` with `raise e`
    content = content.replace('raise e}")', 'raise e')
    content = content.replace('raise e}")\n', 'raise e\n')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
