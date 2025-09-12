#!/bin/bash

# deploy plugin to test vault
echo "building plugin in development mode..."
npm run dev

echo "creating plugin directory..."
mkdir -p tests/cshVault/.obsidian/plugins/custom-syntax-highlights

echo "copying plugin files to test vault..."
cp -f main.js manifest.json styles.css tests/cshVault/.obsidian/plugins/custom-syntax-highlights/

echo "plugin deployed to test vault successfully!"
