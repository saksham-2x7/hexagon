import glob
import os
import re

for f in glob.glob("backend/tests/test_*.py"):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    basename = os.path.basename(f)
    test_name = basename.replace(".py", "")
    
    # replace def main(): with def test_xxx():
    content = content.replace("def main():", f"def {test_name}():")
    
    # remove the if __name__ == "__main__": main() block
    content = re.sub(r'if __name__ == .__main__.:\s+main\(\)', '', content)
    
    # replace except Exception as e: print... with except Exception as e: raise
    # We will just replace "except Exception as e:" with "except Exception as e:\n        raise e"
    # Actually, some of them have print(f"\n❌ FAILURE: {str(e)}")
    # We can just do:
    content = re.sub(r'except Exception as e:\s+print\([^)]+\)', 'except Exception as e:\n        raise e', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
