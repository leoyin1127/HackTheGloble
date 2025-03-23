#!/bin/bash

# Run the import script with increased memory limit
# The --max-old-space-size flag increases the heap size (in MB)
NODE_OPTIONS="--max-old-space-size=8192 --expose-gc" npm run import-data

# The --expose-gc flag makes the global.gc() function available which allows forcing garbage collection
# This helps free up memory during import process

# Notes:
# 1. If you still encounter memory issues, you can try with larger allocation:
# NODE_OPTIONS="--max-old-space-size=16384 --expose-gc" npm run import-data
#
# 2. If issues persist, you can also lower the IMPORT_LIMIT in the import script
#
# 3. If you get TypeScript errors about 'global.gc' not existing,
#    add this to the top of your file:
#    declare global {
#      namespace NodeJS {
#        interface Global {
#          gc: () => void;
#        }
#      }
#    } 