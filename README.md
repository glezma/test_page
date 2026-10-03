# SalesIQ widget test page

A static page for trying the Atena Zoho SalesIQ chat in a browser before the mobile build. It loads the SalesIQ web widget (US data centre). The page also offers buttons to open the chat, close it and reset the visitor, plus an event log.

## Use

1. In SalesIQ, open **Settings → Brands → (brand) → Installation → Website** and copy the widget code (the `wc=` value).
2. Open the page and paste the code. You can also open it with `?wc=<code>`.
3. Follow the checklist on the page.

The widget code is kept only in the browser's `localStorage` and is never committed. Add the site's domain under the brand's allowed websites if SalesIQ restricts widget domains.

## Run locally

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.
