#!/bin/bash

if [ ! -d "extension" ]; then
  mkdir extension && cd extension
  yo code --extensionName folder-structure-generator --extensionDisplayName "Folder Structure Generator" --extensionDescription "Create folder/file structure from .txt format" --pkgManager npm --extensionType "ext-ts" --gitInit false --typescript
else
  cd extension
fi

npm install
npm run compile
tail -f /dev/null
