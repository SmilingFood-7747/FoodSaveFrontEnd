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

## Fake API

The frontend reads initial data from [the deployed fake API](https://foodsavefakeapi.onrender.com/) using **GET only**. `ApiDatabase` loads the ten resources during startup. Accounts, reservations, offers and other changes made through the frontend are saved only in this browser's localStorage; photos stay in IndexedDB. The frontend never sends POST, PUT, PATCH or DELETE requests to the fake API.

Reload the page to fetch updated API data while retaining local changes. Local IDs use a separate range from the seed IDs. Local changes are scoped to the configured API URL and do not appear on other devices. Records from the previous browser demo are left untouched and are not uploaded. The session stays in sessionStorage, and the language preference stays in localStorage.

When location permission is already granted, the frontend resumes location on entry. Available offers within 7 km (temporarily expanded from 2 km) trigger a six-second nearby toast once per page visit, even if the offer is already in the notification history. Returning or reloading allows the toast again; the notification history still avoids duplicate entries for the same account, offer and offer version.

The application displays a retry option when the API cannot be reached. Render may need time to wake up. JSON Server provides the sample data; authentication and business operations are simulated in the browser.

### Run the API locally

The fake API is a separate project at `D:\FoodSaveFakeApi`, with its own `db.json`, dependencies and scripts. In a separate PowerShell terminal:

```powershell
npm install
npm run server
```

Set `platformProviderApiBaseUrl` to `http://localhost:3000` in `src/environments/environment.development.ts` to use it. Both environment files currently point to Render.

## Environments

- `src/environments/environment.ts`: production configuration (`production: true`).
- `src/environments/environment.development.ts`: development configuration (`production: false`).

## Documentation

- [User stories and requirement traceability](docs/user-stories.md): 29 frontend stories (US02-US30) with acceptance criteria and links to the current implementation.
- [Architectural Decision Records](docs/adrs.md): decisions reflected in the FoodSave frontend, including GET requests to the fake API and browser persistence.
- [Class diagram source](docs/class-diagram.puml): editable PlantUML design of the landing page and web application, including models, services, repositories and components.
