#!/usr/bin/env bash
#
# add-project.sh — add a new project to JavaScript 25 Projects, commit & push.
#
# Usage:
#   ./add-project.sh <folder> "<Day NN>" "<Title>" "<Short description>"
#
# Example:
#   ./add-project.sh day-03-todo-list "Day 03" "To-Do List ✅" "Add, complete and clear daily tasks."
#
# What it does:
#   1. Verifies the project folder exists.
#   2. Inserts a card for it into the landing page (index.html).
#   3. Adds a row for it to the README.md projects table.
#   4. Commits the project folder as its own commit.
#   5. Commits the landing-page + README update.
#   6. Pushes to GitHub (Pages redeploys automatically).

set -euo pipefail

# --- move to the script's own directory (repo root) ---
cd "$(dirname "$0")"

# --- args ---
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <folder> \"<Day NN>\" \"<Title>\" \"<Short description>\"" >&2
    echo "Example: $0 day-03-todo-list \"Day 03\" \"To-Do List ✅\" \"Add and clear tasks.\"" >&2
    exit 1
fi

FOLDER="$1"
DAY="$2"
TITLE="$3"
DESC="$4"

# --- sanity checks ---
if [ ! -d "$FOLDER" ]; then
    echo "Error: folder '$FOLDER' does not exist." >&2
    exit 1
fi
if [ ! -f "index.html" ]; then
    echo "Error: index.html (landing page) not found. Run this from the repo root." >&2
    exit 1
fi
if ! grep -q "NEW_PROJECT_CARD" index.html; then
    echo "Error: insertion marker <!-- NEW_PROJECT_CARD --> not found in index.html." >&2
    exit 1
fi
if grep -q "href=\"$FOLDER/\"" index.html; then
    echo "Error: a card for '$FOLDER' already exists in index.html." >&2
    exit 1
fi
if [ ! -f "README.md" ]; then
    echo "Error: README.md not found. Run this from the repo root." >&2
    exit 1
fi
if ! grep -q "NEW_PROJECT_ROW" README.md; then
    echo "Error: insertion marker <!-- NEW_PROJECT_ROW --> not found in README.md." >&2
    exit 1
fi
if grep -q "($FOLDER/)" README.md; then
    echo "Error: a row for '$FOLDER' already exists in README.md." >&2
    exit 1
fi

# --- derive the day number (e.g. "Day 03" -> "03") for the README table ---
DAY_NUM="$(printf '%s' "$DAY" | grep -oE '[0-9]+' | head -1)"
DAY_NUM="${DAY_NUM:-$DAY}"

# --- build the card HTML ---
read -r -d '' CARD <<EOF || true
            <div class="col-12 col-md-6 col-lg-4">
                <a class="project-card" href="$FOLDER/">
                    <span class="day">$DAY</span>
                    <h2>$TITLE</h2>
                    <p>$DESC</p>
                </a>
            </div>

            <!-- NEW_PROJECT_CARD -->
EOF

# --- insert the card just before the marker (awk keeps it portable) ---
CARD="$CARD" awk '
    /<!-- NEW_PROJECT_CARD -->/ && !done {
        print ENVIRON["CARD"]
        done = 1
        next
    }
    { print }
' index.html > index.html.tmp && mv index.html.tmp index.html

echo "✓ Added card for '$TITLE' to index.html"

# --- build the README table row and insert it before the marker ---
BASE_URL="https://nunobragamoz.github.io/JavaScript-25-Projects"
ROW="| ${DAY_NUM} | [${TITLE}](${FOLDER}/) | [Play](${BASE_URL}/${FOLDER}/) |"

ROW="$ROW" awk '
    /<!-- NEW_PROJECT_ROW -->/ && !done {
        print ENVIRON["ROW"]
        done = 1
        print
        next
    }
    { print }
' README.md > README.md.tmp && mv README.md.tmp README.md

echo "✓ Added row for '$TITLE' to README.md"

# --- commit each part separately, then push ---
git add "$FOLDER"
git commit -q -m "Add ${DAY} - ${TITLE}"
echo "✓ Committed project folder '$FOLDER'"

git add index.html README.md
git commit -q -m "Add ${TITLE} to landing page and README"
echo "✓ Committed landing-page + README update"

git push -q origin main
echo "✓ Pushed to GitHub — Pages will redeploy shortly."
echo ""
echo "Live URL: https://nunobragamoz.github.io/JavaScript-25-Projects/$FOLDER/"
