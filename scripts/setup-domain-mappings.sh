#!/usr/bin/env bash
# Set up Cloud Run domain mappings for AdPulse Portal
# Run this once to map custom domains to Cloud Run services.
# After running, add CNAME records in Cloudflare pointing to ghs.googlehosted.com
# with proxy OFF (DNS only / grey cloud).

set -euo pipefail

PROJECT="otb-dev-platform"
REGION="us-central1"

echo "Creating domain mapping: adpulse.app.outoftheblue.ai -> adpulse-web (prod)"
gcloud beta run domain-mappings create \
  --service=adpulse-web \
  --domain=adpulse.app.outoftheblue.ai \
  --region="$REGION" \
  --project="$PROJECT"

echo ""
echo "Creating domain mapping: qa.adpulse.app.outoftheblue.ai -> adpulse-web-qa (QA)"
gcloud beta run domain-mappings create \
  --service=adpulse-web-qa \
  --domain=qa.adpulse.app.outoftheblue.ai \
  --region="$REGION" \
  --project="$PROJECT"

echo ""
echo "Domain mappings created. Next steps:"
echo "1. Add Cloudflare CNAME records (proxy OFF):"
echo "   adpulse.app.outoftheblue.ai    -> ghs.googlehosted.com"
echo "   qa.adpulse.app.outoftheblue.ai -> ghs.googlehosted.com"
echo "2. Wait 5-15 minutes for Google-managed TLS certificate provisioning"
echo "3. Verify with: curl -s -o /dev/null -w '%{http_code}' https://adpulse.app.outoftheblue.ai"
