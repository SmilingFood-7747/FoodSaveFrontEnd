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
npm install
npm run server
```

## Environments

- `src/environments/environment.ts`: production configuration (`production: true`).
- `src/environments/environment.development.ts`: development configuration (`production: false`).

## Documentation

- [User stories and requirement traceability](docs/user-stories.md): 29 frontend stories (US02-US30) with acceptance criteria and links to the current implementation.
- [Architectural Decision Records](docs/adrs.md): decisions reflected in the FoodSave frontend, including the scope of browser storage and the local fake API.
- [Class diagram source](docs/class-diagram.puml): editable PlantUML design of the landing page and web application, including models, services, repositories and components.
