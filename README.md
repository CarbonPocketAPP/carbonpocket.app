# carbonpocket.app
Website for Carbon Pocket.

## Security headers and hosting

The public site currently serves from GitHub Pages, which does not apply the root _headers file. This repository is configured to serve the static assets through Cloudflare Workers, where _headers applies security response headers to every page. The Cloudflare route is configured for https://carbonpocket.app/*.

## Deploying to Cloudflare

1. Add carbonpocket.app as a zone in the Cloudflare account.
2. Import and verify every current DNS record, including MX, TXT, and subdomain records.
3. Change the domain's nameservers at the registrar to the nameservers Cloudflare assigns. This moves DNS management to Cloudflare; missing records can interrupt email or other services. Keep the GitHub Pages site available until the Cloudflare deployment is verified.
4. From this repository's root, authenticate Wrangler with npx wrangler login and deploy with npx wrangler deploy.

## Verify the response headers

After the nameserver cutover and Worker deployment, check the production response:

shell
curl -sSI https://carbonpocket.app/ | grep -iE '^(x-frame-options|x-content-type-options|content-security-policy):'


Expected values include X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and Content-Security-Policy: frame-ancestors 'none'. The CSP is intentionally sent as an HTTP header: browsers do not enforce frame-ancestors from a <meta http-equiv> tag.
