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

## Environments

- `src/environments/environment.ts`: production configuration (`production: true`).
- `src/environments/environment.development.ts`: development configuration (`production: false`).

Both files define `platformProviderApiBaseUrl` as `http://localhost:3000` and the endpoint paths for the fake API collections. Angular replaces the production file with the development file when running the development configuration.

When a hosted backend is connected, set its URL in the production environment.

## Documentation

- [User stories and requirement traceability](docs/user-stories.md): 32 stories adapted from the SmilingFood report, with acceptance criteria and links to the current implementation.
- [Architectural Decision Records](docs/adrs.md): decisions reflected in the FoodSave frontend, including the scope of browser storage and the local fake API.
- [Class diagram source](docs/class-diagram.puml): editable PlantUML diagram of the current models, repositories, services and components.
- [Class diagram preview](docs/class-diagram.svg): vector preview; open it separately and zoom to read the full diagram.

The requirement documentation distinguishes the local prototype from pending backend services. The frontend has not yet been connected to JSON Server.
