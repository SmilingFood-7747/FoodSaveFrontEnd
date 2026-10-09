# FoodSave: registros de decisiones de arquitectura (ADRs)

## Alcance

Estos registros describen las decisiones de arquitectura del frontend, con su contexto, decisión y consecuencias.

---

## ADR 001: Organización por contextos de dominio

### Estado

Aceptada

### Contexto

FoodSave reúne identidad, negocios, ofertas, reservas, comunicación y soporte.

### Decisión

Organizar el frontend en `iam`, `businesses`, `offers`, `reservations`, `notifications` y `feedback`, con un núcleo `shared`. Cada contexto separa `domain`, `application`, `infrastructure` y `presentation`. Los modelos y reglas de dominio no dependen de componentes Angular.

### Consecuencias

**Positivas:**

- Los requisitos se trazan a capacidades del negocio y las reglas se mantienen fuera de las vistas.
- Los contratos de repositorio permiten cambiar la persistencia sin modificar los modelos.

**Costes y límites:**

- Hay más archivos y deben mantenerse coherentes las dependencias entre contextos.
- Algunas operaciones actuales coordinan varios contextos mediante `ApiDatabase` y se guardan solo en el navegador; un backend futuro deberá definir sus límites transaccionales.

### Evidencia en el proyecto

`src/app/*/domain`, `application`, `infrastructure` y `presentation`; `docs/class-diagram.puml`.

---

## ADR 002: Angular 22 con componentes standalone

### Estado

Aceptada

### Contexto

El frontend necesita navegación por capacidades y dependencias explícitas de los componentes.

### Decisión

Utilizar Angular y Angular Material 22.2.1, TypeScript 6.0.3 y componentes standalone. Las rutas cargan los componentes mediante `loadComponent`; se usan guards de sesión y de responsable de negocio. Los componentes declaran actualmente `ChangeDetectionStrategy.Eager`. TypeScript apunta a ES2022 con comprobación estricta.

### Consecuencias

**Positivas:**

- Los componentes declaran sus dependencias y las rutas pueden cargarse bajo demanda.
- La configuración coincide con las versiones instaladas y evita módulos de aplicación innecesarios.

**Costes y límites:**

- Cada componente debe mantener su lista de imports.
- Las guards del navegador controlan el recorrido del prototipo; la autorización del servicio requiere controles propios del backend.

### Evidencia en el proyecto

`package.json`, `tsconfig.json`, `src/app/app.routes.ts`, `src/app/iam/presentation/guards/session.guard.ts`.

---

## ADR 003: Estado reactivo mediante Signals

### Estado

Aceptada

### Contexto

La disponibilidad, las reservas y los avisos deben reaccionar a cambios de estado y al paso del tiempo.

### Decisión

Usar `signal`, `computed` y `effect` de Angular en servicios de aplicación y componentes. `ApiDatabase.state` contiene la copia en memoria de los recursos HTTP. `commit` aplica cambios sobre una copia y los conserva en localStorage, sin enviarlos al servidor. `ClockService` proporciona una señal de tiempo para vencimientos y recordatorios.

### Consecuencias

**Positivas:**

- Los estados derivados se actualizan a partir del mismo estado local.
- Se evita incorporar una biblioteca adicional de estado para el prototipo.

**Costes y límites:**

- La coherencia depende de que las modificaciones sigan los servicios y el método `commit`.
- La evaluación local de vencimientos y recordatorios depende de que la aplicación esté ejecutándose; no constituye una tarea programada de servidor.

### Evidencia en el proyecto

`ApiDatabase`, `OfferService`, `ReservationService`, `NotificationService`, `ReportingService`, `ClockService`.

---

## ADR 004: Lectura HTTP y cambios locales del prototipo

### Estado

Aceptada para el prototipo

### Contexto

El frontend necesita leer los datos iniciales de la fake API y simular las operaciones sin modificar el servidor.

### Decisión

Definir contratos abstractos `AccountRepository`, `BusinessRepository`, `OfferRepository`, `ReservationRepository`, `NotificationRepository` y `FeedbackRepository`. `app.config.ts` los resuelve con adaptadores `Api*Repository` y espera la carga de las diez colecciones mediante un inicializador. `ApiDatabase` usa HttpClient y la URL del entorno exclusivamente para peticiones GET. Las acciones del usuario actualizan la copia en memoria y guardan diferencias en localStorage con una clave vinculada a la URL de origen. Al actualizar desde la API se combinan los datos remotos y esas diferencias locales. Los registros locales usan IDs desde 1000000001. La sesión utiliza sessionStorage con la clave `foodsave-api-session`. La base anterior del navegador se conserva sin importarla automáticamente.

### Consecuencias

**Positivas:**

- Todos los recorridos comienzan con los datos de la fake API; registro, ofertas y reservas se simulan de forma local.
- Los adaptadores concretos se separan de los contratos de dominio.

**Costes y límites:**

- La aplicación requiere una API disponible y ofrece reintentar la carga y actualizar los datos.
- Los cambios del usuario pertenecen a un navegador y no se comparten entre dispositivos. Limpiar localStorage elimina esos cambios.
- El frontend no envía POST, PUT, PATCH ni DELETE. La coherencia del stock y las reservas se simula localmente; no existe una operación de negocio transaccional en el servidor.

### Evidencia en el proyecto

`src/app/app.config.ts`, `src/app/shared/infrastructure/api-database.ts`, los contratos y adaptadores de cada contexto.

---

## ADR 005: Fake API y entornos separados

### Estado

Aceptada para desarrollo

### Contexto

El desarrollo necesita datos de muestra y una configuración de acceso a recursos HTTP por entorno.

### Decisión

Separar la fake API en `D:\FoodSaveFakeApi`, con JSON Server 0.17.4, su propio `db.json`, `package.json`, `package-lock.json` y `.gitignore`. Ejecutar `npm run server` desde esa carpeta para exponer CRUD en el puerto 3000. Definir `environment.ts` y `environment.development.ts` con URL base y rutas de las diez colecciones. Configurar `fileReplacements` para desarrollo. Ambos entornos apuntan a `https://foodsavefakeapi.onrender.com`. La aplicación consume esas rutas mediante `ApiDatabase`; para utilizar la instancia local se modifica la URL del entorno de desarrollo.

### Consecuencias

**Positivas:**

- Los recursos de cuentas, negocios, ofertas, reservas, avisos, opiniones, soporte y preferencias tienen endpoints reproducibles para desarrollo.
- La ubicación de la API se puede configurar sin dispersar URLs en componentes.

**Costes y límites:**

- JSON Server ofrece CRUD de muestras; no implementa autenticación, autorización, cálculo de vencimiento ni reserva transaccional.
- Las fechas de las muestras son fijas y deben mantenerse para escenarios dependientes del tiempo.
- La API alojada en Render puede tardar en iniciar y sus datos de ejecución no son persistentes entre reinicios.
- Las rutas actuales de la fake API no usan el prefijo `/api/v1`.

### Evidencia en el proyecto

`D:\FoodSaveFakeApi\db.json`, `D:\FoodSaveFakeApi\package.json`, `angular.json`, `src/environments/environment.ts`, `src/environments/environment.development.ts`.

---

## ADR 006: Reglas de oferta, reserva e identidad

### Estado

Aceptada para el prototipo

### Contexto

Una oferta no debe aceptar unidades inexistentes y una reserva debe conservar las condiciones confirmadas y pertenecer al actor autorizado.

### Decisión

Encapsular validación de precios, unidades y ventana en `Offer`; cancelación y recojo en `Reservation`. Los servicios comprueban rol, propiedad y asociaciones. La creación de reservas actualiza oferta, reserva y avisos en una copia local; los cambios se conservan únicamente en este navegador. Las contraseñas de cuentas registradas se derivan con PBKDF2 SHA-256, salt y 120000 iteraciones; las cuentas de muestra inicializan su hash al primer acceso válido.

### Consecuencias

**Positivas:**

- Las reglas pueden reutilizarse en distintos recorridos de presentación.
- El prototipo rechaza reservas no disponibles, códigos inválidos, calificaciones duplicadas y modificaciones de recursos ajenos.

**Costes y límites:**

- Las comprobaciones ejecutadas en el cliente no sustituyen la autorización ni validación de servidor.
- La publicación real requiere garantizar reserva y stock de forma transaccional, proteger credenciales y definir el servicio de sesión.

### Evidencia en el proyecto

`Offer`, `Reservation`, `SessionService`, `BusinessService`, `OfferService`, `ReservationService`, `FeedbackService`.

---

## ADR 007: Internacionalización de la interfaz

### Estado

Aceptada

### Contexto

US07 requiere comprender la plataforma en español e inglés y conservar la preferencia de idioma.

### Decisión

Usar `@ngx-translate/core` y `@ngx-translate/http-loader` 18.0.0, con diccionarios en `public/i18n`. `LanguageService` coordina la selección y `LanguageSwitcher` permite cambiarla. Los textos comerciales aportados por negocios se conservan en su idioma original.

### Consecuencias

**Positivas:**

- Los mensajes y etiquetas del sistema se administran por claves y cambian durante la navegación.
- Los textos del producto no se modifican por una traducción automática implícita.

**Costes y límites:**

- Deben mantenerse las mismas claves en ambos diccionarios.
- El contenido libre de negocios y algunos formatos locales no equivalen a una traducción integral de todos los datos.

### Evidencia en el proyecto

`src/app/app.config.ts`, `LanguageService`, `LanguageSwitcher`, `LocalizedFormatPipe`, `public/i18n/en.json` y `es.json`.

---

## ADR 008: Angular Material y estilos delimitados por componente

### Estado

Aceptada

### Contexto

El frontend necesita componentes de interacción consistentes y la identidad visual de FoodSave.

### Decisión

Usar Angular Material 22 con Material 3, tipografía Lato, paletas verde y naranja y variables globales en `src/styles.scss`. Los componentes usan `ViewEncapsulation.None` y sus reglas CSS se delimitan con el selector del componente, por ejemplo `app-layout .sidebar`. Se conserva la precarga inicial de módulos JavaScript generada por Angular.

### Consecuencias

**Positivas:**

- Los componentes Material y los estilos del producto comparten una configuración visual.
- Los estilos propios se organizan por componente sin los atributos generados de encapsulación emulada.

**Costes y límites:**

- La delimitación CSS es manual y un selector demasiado general puede afectar componentes descendientes.
- Los archivos `chunk` y el script principal forman parte del código compilado necesario para ejecutar la aplicación.

### Evidencia en el proyecto

`src/styles.scss`, `src/app/*/presentation`, `angular.json`.

---

## ADR 009: Imágenes de muestra y archivos locales

### Estado

Aceptada para el prototipo

### Contexto

Las ofertas necesitan imágenes de muestra y una forma de previsualizar archivos elegidos por el responsable del negocio.

### Decisión

Mantener las imágenes de muestra en `public/assets` y su ruta en el campo `image` de las ofertas. `BrowserImageStorage` guarda las fotos elegidas en IndexedDB (`foodsave-images`) y devuelve referencias `local-image:<id>`. Al resolverlas crea una URL blob temporal. Las fotos no se envían a la API.

### Consecuencias

**Positivas:**

- Las imágenes incluidas con el frontend se publican junto con sus assets.
- Una foto local puede recuperarse al volver a abrir el mismo navegador.

**Costes y límites:**

- Las fotos locales dependen del navegador original y se pierden al limpiar IndexedDB.
- Compartir fotos entre dispositivos requeriría incorporar almacenamiento de servidor en una etapa posterior.

### Evidencia en el proyecto

`public/assets`, `db.json`, `BrowserImageStorage`, `OfferEditor`.

---

## ADR 010: Publicación del frontend estático

### Estado

Aceptada

### Contexto

La aplicación debe estar disponible mediante una URL pública y conservar el historial del equipo.

### Decisión

Publicar `dist/frontend-foodsave/browser` en Firebase Hosting, proyecto `foodsave2502`, sitio `frontfoodsave`, con reescritura de rutas a `index.html`. La publicación actual es manual con Firebase CLI. El repositorio principal es `SmilingFood-7747/FoodSaveFrontEnd` y conserva el historial anterior. Se retiró el workflow heredado de Azure para detener los intentos de despliegue con cada push.

### Consecuencias

**Positivas:**

- La aplicación y sus assets se distribuyen como frontend estático con soporte de navegación SPA.
- El historial de Git permite identificar cambios y versiones del código.

**Costes y límites:**

- Un push al repositorio no publica automáticamente en Firebase con la configuración actual.
- Firebase Hosting no ejecuta el JSON Server local ni convierte `db.json` en un backend.
- La automatización de despliegue y el alojamiento de un backend son decisiones adicionales.

### Evidencia en el proyecto

`firebase.json`, `.firebaserc`, configuración de remotos de Git.
