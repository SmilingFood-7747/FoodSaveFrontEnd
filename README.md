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

The fake API is a separate project at `D:\FoodSaveFakeApi`, with its own `db.json`, dependencies and scripts. In a separate PowerShell terminal:

```powershell
cd D:\FoodSaveFakeApi
npm install
npm run server
```

JSON Server 0.17.4 runs at `http://localhost:3000`. Collections include accounts, businesses, offers, reservations, notifications, reviews, requests, preferences, subscriptions and subscriptionCharges. API changes are saved to the fake API project's `db.json`. Sample pickup and expiration dates are fixed; update them in that file when needed.

The frontend currently uses browser storage. Connecting it to this API is a separate step. Firebase Hosting serves the frontend; the local API runs on your computer.

## Environments

- `src/environments/environment.ts`: production configuration (`production: true`).
- `src/environments/environment.development.ts`: development configuration (`production: false`).

Both files define `platformProviderApiBaseUrl` as `http://localhost:3000` and the endpoint paths for the fake API collections. Angular replaces the production file with the development file when running the development configuration.

When a hosted backend is connected, set its URL in the production environment.

## Documentation

- [User stories and requirement traceability](docs/user-stories.md): 29 frontend stories (US02-US30) with acceptance criteria and links to the current implementation.
- [Architectural Decision Records](docs/adrs.md): decisions reflected in the FoodSave frontend, including the scope of browser storage and the local fake API.
- [Class diagram source](docs/class-diagram.puml): editable PlantUML design of the landing page and web application, including models, services, repositories and components.
- [Class diagram preview](docs/class-diagram.png): complete diagram of the landing page and web application.
- [Class diagram vector](docs/class-diagram.svg): SVG version of the diagram.

The user stories cover this frontend and retain their story IDs; separate landing content and backend service stories are excluded. The frontend has not yet been connected to JSON Server.
