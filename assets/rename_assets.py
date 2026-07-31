import os
from pathlib import Path

# Targets the current directory where the script is executed
TARGET_DIR = Path.cwd()

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Filter out the script itself and match image files
files = [
    f for f in TARGET_DIR.iterdir()
    if f.is_file() 
    and f.suffix.lower() in VALID_EXTENSIONS 
    and f.name != Path(__file__).name
]

# Sort files alphabetically/numerically
files.sort(key=lambda x: x.name)

print(f"Found {len(files)} images in {TARGET_DIR}")

if not files:
    print("No images found to rename.")
    exit(0)

# Pass 1: Rename to temp names to avoid collisions
temp_files = []
for idx, file_path in enumerate(files, start=1):
    ext = file_path.suffix.lower()
    temp_path = file_path.with_name(f"__temp_{idx}{ext}")
    file_path.rename(temp_path)
    temp_files.append((idx, temp_path))

# Pass 2: Final rename to photo_x
for idx, temp_path in temp_files:
    ext = temp_path.suffix
    final_path = temp_path.with_name(f"photo_{idx}{ext}")
    temp_path.rename(final_path)

print(f"Successfully renamed {len(files)} images to photo_1, photo_2, etc.")