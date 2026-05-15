#!/bin/bash

# Directory where Jekyll generates the site
JEKYLL_DEST_DIR="_site"
JEKYLL_PID=""
CLEANED_UP=false

port_in_use() {
    local port="$1"

    if command -v ss >/dev/null 2>&1; then
        ss -ltn "sport = :$port" | tail -n +2 | grep -q .
    elif command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    else
        return 1
    fi
}

check_ports() {
    local has_conflict=false

    for port in 4000 35729; do
        if port_in_use "$port"; then
            echo "Error: port $port is already in use. Stop the existing Jekyll/LiveReload server first."
            has_conflict=true
        fi
    done

    if [ "$has_conflict" = true ]; then
        exit 1
    fi
}

# Function to clean up generated files
cleanup() {
    if [ "$CLEANED_UP" = true ]; then
        return
    fi
    CLEANED_UP=true

    if [ -n "$JEKYLL_PID" ] && kill -0 "$JEKYLL_PID" >/dev/null 2>&1; then
        kill -INT "$JEKYLL_PID" >/dev/null 2>&1 || true
        wait "$JEKYLL_PID" >/dev/null 2>&1 || true
    fi

    echo "Cleaning up..."
    rm -rf "$JEKYLL_DEST_DIR"
    echo "Cleanup done."
}

# Trap signals and errors (EXIT, INT, TERM) to ensure cleanup is performed
trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM

# Function to build the Jekyll site
build_site() {
    echo "Building Jekyll site..."
    if ! bundle exec jekyll build; then
        echo "Error building site, exiting."
        exit 1
    fi
}

# Function to serve the site locally
serve_site() {
    echo "Serving Jekyll site locally..."
    # Serve the site in the background so we can trap signals
    # Added --incremental for faster rebuilds on file changes
    # Added --livereload to auto-refresh the browser
    # Added --force_polling to fix file watching issues on WSL/Windows mounts
    bundle exec jekyll serve --incremental --livereload --force_polling &
    # Capture the background process's PID
    JEKYLL_PID=$!
    # Wait for the Jekyll server process to finish
    wait $JEKYLL_PID
}

# Main script execution starts here

check_ports

# Build the site, script exits if this fails
build_site

# Serve the site locally
serve_site

# Script will clean up generated files upon exit due to the trap set earlier
