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

The frontend reads and saves data using [the deployed fake API](https://foodsavefakeapi.onrender.com/). `ApiDatabase` loads the ten resources during startup; the `Api*Repository` adapters expose this state and await HTTP writes before reporting success. Use **Refresh data** to reload changes made from another session.

The application displays a retry option when the API cannot be reached. Render may need time to wake up. There is no browser database fallback; records from the previous local demo are not automatically uploaded. Only the session, language and dismissed nearby alerts stay in browser storage.

JSON Server is a prototype service, without server authentication or transactional stock guarantees. Runtime writes on Render's ephemeral filesystem can be lost on a restart or redeploy; `db.json` supplies the initial data.

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
- [Architectural Decision Records](docs/adrs.md): decisions reflected in the FoodSave frontend, including HTTP persistence and the fake API.
- [Class diagram source](docs/class-diagram.puml): editable PlantUML design of the landing page and web application, including models, services, repositories and components.
