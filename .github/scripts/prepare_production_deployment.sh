#!/bin/bash

set -ev

# Only:
# - Tagged commits
# - Security env variables are available.
echo "🚀 Preparing deploy for version $VERSION_TAG. Calling hook Url: $PROD_DEPLOYMENT_HOOK_URL"

if [ -n "$VERSION_TAG" ]
then
  echo "VERSION_TAG is set" 
else
  echo "VERSION_TAG is not set"
fi

if [ -n "$PROD_DEPLOYMENT_HOOK_TOKEN" ]
then
  echo "PROD_DEPLOYMENT_HOOK_TOKEN is set" 
else
  echo "PROD_DEPLOYMENT_HOOK_TOKEN is not set"
fi

if [ -n "$PROD_DEPLOYMENT_HOOK_URL" ]
then
  echo "PROD_DEPLOYMENT_HOOK_URL is set" 
else
  echo "PROD_DEPLOYMENT_HOOK_URL is not set"
fi


if [ -n "$VERSION_TAG" ] && [ -n "$PROD_DEPLOYMENT_HOOK_TOKEN" ] && [ -n "$PROD_DEPLOYMENT_HOOK_URL" ]
then
  echo "Calling hook"
  exit $?
  # curl --silent --output /dev/null --write-out "%{http_code}" -X POST \
  #    -F token="$PROD_DEPLOYMENT_HOOK_TOKEN" \
  #    -F ref=master \
  #    -F "variables[TRIGGER_RELEASE_COMMIT_TAG]=$VERSION_TAG" \
  #     $PROD_DEPLOYMENT_HOOK_URL
else
  echo "[ERROR] Deployment to production could not be prepared"
fi
