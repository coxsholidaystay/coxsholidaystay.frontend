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
request, contact details, guest count, and room category, then stores it in
MongoDB; a request is not a confirmed reservation or payment.

The room catalog includes detailed room pages at `/rooms/<room-id>`. The
dashboard starts at `/dashboard` and includes booking requests, properties,
rooms, and users. Dashboard APIs only allow accounts listed in the backend
`ADMIN_EMAILS` environment variable. Admins can update booking request status,
edit property information, manage room inventory, and suspend or reactivate
guest accounts. Suspended users are signed out and cannot sign in until
reactivated.

Development output is written to `.next-dev`, separately from the `.next`
production build directory, so running the dev server and building the project
at the same time does not overwrite each other's generated chunks.
