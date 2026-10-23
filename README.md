# The Thrift Hub

Pre-loved streetwear store — static site (HTML/CSS/JS, GSAP + Lenis + Matter.js). No build step.

## Live karna (GitHub + Vercel)
1. GitHub pe naya repo banayein (e.g. `thrift-hub`).
2. Is folder mein terminal kholein:
   ```bash
   git init
   git add .
   git commit -m "The Thrift Hub website"
   git branch -M main
   git remote add origin https://github.com/<username>/thrift-hub.git
   git push -u origin main
   ```
3. vercel.com → **Add New → Project** → repo import karein.
   Framework Preset: **Other** · Build Command: khaali · Output Directory: khaali (root) → **Deploy**.
4. Har `git push` pe Vercel khud update kar dega.

## Edit karna
- Products, prices, photos: `assets/js/data.js`
- Photos: transparent PNG/WebP `assets/img/` mein
- WhatsApp number: `data.js` → `TH_WHATSAPP`
- Email: `contact.html`
