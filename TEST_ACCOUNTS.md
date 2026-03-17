# CAI Drive - Test Accounts Guide

## Quick Setup: Super Admin Account

To create your admin account (aslan@renascence.io), open browser console on the deployed site and run:

```javascript
fetch('/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'aslan@renascence.io',
    password: 'rDf462sF',
    secretKey: 'cai-admin-setup-2024'
  })
}).then(r => r.json()).then(console.log)
```

Or via curl:

```bash
curl -X POST https://YOUR_DEPLOYMENT_URL/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"aslan@renascence.io","password":"rDf462sF","secretKey":"cai-admin-setup-2024"}'
```

### Admin Login
- **Email:** aslan@renascence.io
- **Password:** rDf462sF
- **Access:** Full platform access

---

## Portal URLs

| Portal | URL | Access |
|--------|-----|--------|
| Home | `/` | Public |
| Browse Cars | `/cars` | Public |
| Car Details | `/cars/[id]` | Public |
| Places | `/places` | Public |
| Login | `/auth/login` | Public |
| Sign Up | `/auth/sign-up` | Public |
| My Rides | `/rides` | Requires Login |
| Wishlist | `/wishlist` | Requires Login |
| Profile | `/profile` | Requires Login |

## Features by Access Level

### Public (No Login)
- Browse all vehicles with Spotlight AI search
- View car details, specs, pricing
- See reviews and ratings
- Explore partner locations with discounts
- Filter and search cars

### Logged In User
- All public features
- Book vehicles
- Save cars to wishlist
- View booking history (My Rides)
- Leave reviews
- Manage profile and payment methods

### Admin
- Everything above
- User management
- Company verification
- Platform analytics
- Document approval

## Theme

Click the sun/moon icon in the header to toggle between light and dark mode.
