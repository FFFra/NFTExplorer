#!/bin/bash

# Find all text files in the project directory, excluding .git and node_modules
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/dist/*" | while read file; do
    # Check if file is a text file
    if file "$file" | grep -q "text"; then
        # Check if file already ends with a newline
        if [ -s "$file" ] && [ "$(tail -c 1 "$file" | xxd -p)" != "0a" ]; then
            echo "Adding newline to $file"
            echo "" >> "$file"
        fi
    fi
done

# Stage all changes
git add .

# Get the last commit message
commit_msg=$(git log -1 --pretty=%B)

# Amend the previous commit with the same message
git commit --amend -m "$commit_msg"

echo "All text files now end with a newline and the previous commit has been amended."

