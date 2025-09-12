#!/bin/bash

# deploy plugin to test vault
# use --build flag to trigger build, default is copy-only
if [ "$1" = "--build" ]; then
    echo "building plugin..."
    npm run build
else
    echo "copying existing build (use --build flag to rebuild)..."
fi

echo "creating plugin directory..."
mkdir -p tests/cshVault/.obsidian/plugins/custom-syntax-highlights

echo "copying plugin files to test vault..."
cp -f main.js manifest.json styles.css tests/cshVault/.obsidian/plugins/custom-syntax-highlights/

echo "plugin deployed to test vault successfully!"
