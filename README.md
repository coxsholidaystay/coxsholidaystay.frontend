# coxsholidaystay.frontend

The Next.js frontend for Cox's Holiday Stay.

## Run locally

```powershell
npm install
# Copy .env.example to .env and adjust the API URL if needed.
npm run dev
```

Open `http://localhost:3000`. The API URL defaults to
`http://localhost:4000`; set `NEXT_PUBLIC_API_URL` to use another address.

## Production build

```powershell
npm run build
npm run start
```

Room requests can be submitted without signing in. The API validates the
request and stores it in MongoDB; a request is not a confirmed reservation or
payment.
