# RideShare Frontend

A modern rideshare application built with React and Vite.

## Features

- Passenger registration and login
- Driver registration and login
- Admin dashboard
- Ride booking and payment
- Responsive design

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the Vite configuration and deploy

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=https://your-backend-url.com
```

For demo purposes, the app falls back to mock data when API calls fail.