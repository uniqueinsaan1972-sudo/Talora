# TALORA Android (Bubblewrap / TWA): update and release steps
These steps need your signing keystore, your Bubblewrap project and a real Android phone, so they were NOT run. Do not change the package ID or replace the keystore.

1. Deploy the web changes: put the changed files on a Git branch, merge, let Vercel deploy. Check in a browser that /manifest.webmanifest and /sw.js open.
2. Digital Asset Links (removes the browser bar inside the app):
   - Copy docs/assetlinks.template.json to apps/web/public/.well-known/assetlinks.json.
   - package_name = "packageId" in your Bubblewrap twa-manifest.json (unchanged).
   - sha256_cert_fingerprints = SHA-256 of the key that signs the installed app. Own keystore: `keytool -list -v -keystore <your.keystore> -alias <alias>`. With Google Play App Signing, copy the "App signing key certificate" SHA-256 from Play Console -> App integrity (add the upload key too if you also sideload the APK).
   - Redeploy, then open https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://talora-phi.vercel.app&relation=delegate_permission/common.handle_all_urls and check your package and fingerprint are listed.
3. In your Bubblewrap project folder: `bubblewrap update`, raise appVersionCode and appVersion in twa-manifest.json, then `bubblewrap build` with the existing keystore. Output: app-release-signed.apk (install and test) and app-release-bundle.aab (Play Store).
4. Test on a real phone: login persists after closing and reopening; no URL bar; Android back button; Urdu is right-to-left; Downloads -> Download all, then airplane mode: lessons open, tests say they need internet; finish a lesson offline, go online, XP appears.
