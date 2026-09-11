# React + Vite

## Local Plaid data check

The app itself always reads only the published Google Sheet. Loading the app or
using its Refresh button never calls Plaid or runs a local script.

1. Copy `.env.example` to `.env.local` if `.env.local` does not already exist.
2. Add the Plaid client ID, the secret matching `PLAID_ENV`, and each connected
   institution's access token. Leave unconnected institutions blank; they will
   be reported as skipped.
3. To fetch and print Plaid data independently of the app, run:

```bash
npm run plaid:fetch
```

U.S. Bank and Chase call `/accounts/balance/get`. Robinhood calls both
`/accounts/balance/get` and `/investments/holdings/get`.

## Scheduled spreadsheet refresh

The `Refresh portfolio` GitHub Actions workflow runs at midnight, 6:00 AM,
noon, and 6:00 PM in the `America/Denver` timezone. It fetches Plaid balances,
replaces the matching U.S. Bank, Chase, and Robinhood rows in the first visible
sheet, preserves all other account rows, and updates the date in cell `B1`.
GitHub Pages continues to read the published CSV configured in `src/config.jsx`.

### Google setup

1. In Google Cloud, create or select a project and enable the Google Sheets API.
2. Create a service account, add a JSON key, and download the key file.
3. Open the JSON file, copy its `client_email`, and share the editable Google
   Sheet with that email as an Editor.
4. Copy the spreadsheet ID from the editable URL. For a URL shaped like
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`, copy only the
   `SPREADSHEET_ID` value. The existing published `/d/e/.../pub` URL does not
   contain this ID.

### GitHub setup

In the repository, open **Settings → Secrets and variables → Actions**, then add
these repository secrets:

- `PLAID_CLIENT_ID`
- `PLAID_PRODUCTION_SECRET`
- `PLAID_US_BANK_ACCESS_TOKEN`
- `PLAID_CHASE_ACCESS_TOKEN`
- `PLAID_ROBINHOOD_ACCESS_TOKEN`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — paste the complete downloaded JSON file
- `GOOGLE_SPREADSHEET_ID`

Push the workflow to the default branch, then open **Actions → Refresh
portfolio → Run workflow** once to verify it. Scheduled runs use the latest
commit on the default branch. The sync command intentionally logs only the
updated account count and sheet name, not balances or credentials.

The sync owns columns `A:D` in the first visible sheet. It expects the existing
layout: update metadata in row 1, headers in row 2, and account data starting in
row 3 (`name`, `type`, `category`, `balance`). To run the same sync locally, set
`GOOGLE_SPREADSHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` in `.env.local`
in addition to the Plaid variables, then run:

```bash
npm run portfolio:sync
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
