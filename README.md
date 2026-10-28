# carbonpocket.app
Website for Carbon Pocket

Deploy this site with the Cloudflare Workers static-assets configuration in
`wrangler.jsonc` (for example, `npx wrangler deploy`). The root `_headers` file
sets the security response headers for static assets. GitHub Pages does not
apply `_headers`; if the custom domain is still served by GitHub Pages, move
the deployment or put Cloudflare in front of it for these headers to take
effect.
