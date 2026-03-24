# Shivani Photography — Frontend

React SPA for [shivanijadonphotography.com](https://shivanijadonphotography.com).
This is a git submodule of [shivani-photography](https://github.com/mayankbhadauria/shivani-photography).

## Stack

- React 17
- styled-components
- Amazon Cognito Identity JS (auth, no Amplify)
- Axios

## Pages / Components

| Component | Description |
|---|---|
| `App.js` | View router, session management, 10-min inactivity logout |
| `LoginPage.js` | Split-panel login with dynamic background image |
| `HomePage.js` | Hero + category grid + highlights + footer |
| `gallery.js` | Editorial 2-column masonry gallery with lightbox |
| `AboutMePage.js` | Bio page with portrait photo |
| `ReservationPage.js` | Session pricing cards |
| `ContactPage.js` | Contact form |
| `InfoPage.js` | What to wear tips + FAQ accordion |
| `AdminPage.js` | Upload manager + highlights editor (Admin only) |
| `SharedNav.js` | Reusable navigation bar for all pages |
| `GetInTouch.js` | Reusable CTA footer section |

## Local Development

```bash
npm install
npm start     # http://localhost:3000
```

Requires `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_BcEX8Ytg2
REACT_APP_COGNITO_APP_CLIENT_ID=7ki1081bbgu6529j8ohftmujvi
```

## Build

```bash
npm run build
```

Production build is deployed to S3 by `backend/deploy_lambda.sh`.
