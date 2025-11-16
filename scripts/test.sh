#!/bin/bash

# deploy plugin to test vault; always build before deploying
if [ "$1" != "nobuild" ]; then
    echo "building plugin before deploying to test vault..."
    npm run build --silent
fi

# get plugin id from manifest.json; suppress node error output
pluginID=$(node -p "require('./manifest.json').id" 2>/dev/null)
if [ -z "$pluginID" ]; then
    echo "error: could not read plugin id from manifest.json"
    exit 1
fi

# create plugin directory and copy files
dst="tests/cshVault/.obsidian/plugins/$pluginID"
mkdir -p "$dst"
cp -f main.js manifest.json styles.css "$dst/"
echo "plugin deployed to test vault successfully!"
