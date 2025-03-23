#!/bin/bash

echo "Starting direct image import (2000 images)"
echo "Node version: $(node -v)"

# Run the direct import script
npm run direct-import

echo "Import complete!" 