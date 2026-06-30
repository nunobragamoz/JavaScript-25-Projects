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
#   3. Commits the project folder as its own commit.
#   4. Commits the landing-page update.
#   5. Pushes to GitHub (Pages redeploys automatically).

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

# --- commit each part separately, then push ---
git add "$FOLDER"
git commit -q -m "Add ${DAY} - ${TITLE}"
echo "✓ Committed project folder '$FOLDER'"

git add index.html
git commit -q -m "Add ${TITLE} card to landing page"
echo "✓ Committed landing-page update"

git push -q origin main
echo "✓ Pushed to GitHub — Pages will redeploy shortly."
echo ""
echo "Live URL: https://nunobragamoz.github.io/JavaScript-25-Projects/$FOLDER/"
