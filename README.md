# SocietyBulk

SocietyBulk is a college-project demo for community grocery bulk buying. Residents can browse products, place orders, and pay through Razorpay Checkout. The coordinator can manage products and residents, track orders, review paid-order demand, record bulk purchases, and view estimated savings.

## Requirements

- Java 21
- Node.js and npm
- MySQL

## Run locally

1. Create or use a MySQL account. The backend creates the `societybulk` database automatically. Its default connection is `root` / `root`; override it with the `DB_USERNAME` and `DB_PASSWORD` environment variables if needed. These defaults are for local development only and must not be used on a public deployment.
2. Razorpay is optional for running the project. Without backend Razorpay keys, checkout cannot start. If you later obtain test credentials, set them in the PowerShell window that will run the backend:

   ```powershell
   $env:RAZORPAY_KEY_ID = "your_test_key_id"
   $env:RAZORPAY_KEY_SECRET = "your_test_key_secret"
   ```

   These are backend-only environment variables. Never put the Key Secret in frontend code or share it in chat/source control. The Key ID is sent to Razorpay Checkout and is not a secret. Do not use live keys for a public college-project demo.
3. Start the backend:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

   The API runs at `http://localhost:4000/api`. JPA creates/updates the schema and `data.sql` seeds sample products and the coordinator account.
4. Start the frontend in a separate terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Set `VITE_API_BASE_URL` in `frontend/.env` only if the API uses a different base URL.

   The repository ignores local `.env` files. If needed, copy `frontend/.env.example` to `frontend/.env` and edit the local values.

## Temporarily share with friends

The frontend Vite server proxies `/api` requests to the local backend, so only the frontend needs a tunnel. Keep MySQL, the backend, and the frontend running on your PC.

1. Restart the frontend dev server after configuration changes:

   ```powershell
   cd frontend
   npm run dev
   ```

2. Install Cloudflare Tunnel if needed:

   ```powershell
   winget install --id Cloudflare.cloudflared
   ```

3. Open another PowerShell window and start a temporary tunnel:

   ```powershell
   cloudflared tunnel --url http://localhost:5173
   ```

4. Share the `https://...trycloudflare.com` URL printed in the terminal. Keep the tunnel window open; stop it with Ctrl+C when testing is finished.

This demo link is public to anyone who gets it and is temporary. Share it only with people you trust, do not use real personal data, and do not share the coordinator login for public testing. Use Razorpay Test Mode only for a tunnel-based demo.

## Product catalog

The sample catalog includes additional dals, soft drinks, and everyday household/personal-care products. Restart the backend after updating the project so the database initializer can add the sample items.

## Demo coordinator account

- Email: `admin@societybulk.com`
- Password: `admin123`

Residents can create their own accounts from the registration page. Registration always creates the `RESIDENT` role; coordinator accounts are not self-registered.

This is a public demo credential stored as a password hash in the sample seed data. Do not use it for a publicly deployed instance; change or remove the seeded coordinator account first.

## Validation

- Frontend production build: `npm run build` (from `frontend`)
- Backend tests: `.\mvnw.cmd test` (from `backend`)

Payments use Razorpay Standard Checkout. The backend creates gateway orders and verifies payment signatures and captured payment details before marking orders paid. Unpaid and cancelled orders are excluded from bulk demand.

The project includes a fixed development-only JWT signing-key fallback in its configuration. Do not deploy with that fallback or the default MySQL `root` / `root` credentials; configure unique secrets and database credentials through environment variables before any public deployment.

To reconcile captured payments if a customer closes the browser before the checkout callback completes, optionally configure a Razorpay webhook:

1. In Razorpay Dashboard (Test Mode), add a webhook pointing to `https://<your-public-host>/api/payments/razorpay/webhook` and subscribe to `payment.captured`.
2. Set the webhook secret in the backend PowerShell window before starting Spring Boot:

   ```powershell
   $env:RAZORPAY_WEBHOOK_SECRET = "your_webhook_secret"
   ```

   Use the exact secret configured for that webhook. A temporary Cloudflare URL changes each run, so update the webhook URL when it changes. A stable deployed API URL is needed for reliable webhook delivery.

Razorpay settles live payments to the bank account configured for the merchant account in the Razorpay Dashboard; SocietyBulk does not collect or store bank details. Test Mode payments do not transfer real money. Do not use live keys for a public college-project demo.
