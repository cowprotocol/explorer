#!/bin/bash
set -e

# Only:
# - Tagged commits
# - Security env variables are available.
echo "🚀 Preparing deploy for version $VERSION_TAG. Calling hook Url: $PROD_DEPLOYMENT_HOOK_URL"

if [ -n "$VERSION_TAG" ] && [ -n "$PROD_DEPLOYMENT_HOOK_TOKEN" ] && [ -n "$PROD_DEPLOYMENT_HOOK_URL" ]
then
  echo "Calling hook"
  # curl --silent --output /dev/null --write-out "%{http_code}" -X POST \
  #    -F token="$PROD_DEPLOYMENT_HOOK_TOKEN" \
  #    -F ref=master \
  #    -F "variables[TRIGGER_RELEASE_COMMIT_TAG]=$VERSION_TAG" \
  #     $PROD_DEPLOYMENT_HOOK_URL
else
  echo  >&2 "[ERROR] Deployment to production could not be prepared. Some Environment variables are missing"
  exit 100
fi
