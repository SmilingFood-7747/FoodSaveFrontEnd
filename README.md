# FrontEndFoodSave

## Development server

```bash
npm install
ng serve --o
```


## Building

```bash
npm run build
```

## Local fake API

The root `db.json` contains FoodSave sample data. Run JSON Server 0.17.4 in a separate terminal:

```bash
npm run server
```

The API runs at `http://localhost:3000` and supports GET, POST, PUT, PATCH and DELETE for these collections:

- `/accounts`
- `/businesses`
- `/offers`
- `/reservations`
- `/notifications`
- `/reviews`
- `/requests`
- `/preferences`

Changes made through the API are saved to `db.json`. The sample pickup and expiration dates are fixed; update them in this file when needed.

The frontend currently uses browser storage. Connecting it to this API is a separate step. Firebase Hosting serves the frontend; the local API runs on your computer.
