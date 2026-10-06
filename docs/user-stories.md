# FoodSave frontend: historias de usuario y requisitos funcionales

## Fuente y alcance

Fuente: informe de SmilingFood `202620-1asi0729-7747-SmilingFood-report-av1.pdf`, sección 3.1 (páginas 31-42 del PDF) y backlog de la sección 3.3 (páginas 44-45). Se seleccionan las 29 historias aplicables al frontend (US02-US30) y se conservan sus identificadores y épicas de origen EP01-EP06. La copia `report-av1cambio` contiene el mismo documento.

La estructura sigue `docs/user-stories.md` del ejemplo Learning Center: descripción, contexto, matriz de trazabilidad y criterios de aceptación. La redacción se centra en actor, necesidad, beneficio y resultados del sistema; no exige una página, botón, tarjeta o formulario concreto. Los criterios se precisan con las reglas actuales del dominio. Se excluyen US01, correspondiente al contenido de la landing externa, y US31-US32, correspondientes a contratos y operaciones del backend. US02 se incluye por su requisito de acceso público al catálogo de esta aplicación.

Roles: visitante, cliente comprador, responsable de negocio y usuario registrado.

### Épicas de origen

| ID | Épica en el informe | Historias |
|---|---|---|
| EP01 | Landing Page | US02-US07 |
| EP02 | Gestión de ofertas | US08-US12 |
| EP03 | Gestión de usuarios | US13-US17 |
| EP04 | Operación del negocio | US18-US22 |
| EP05 | Comunicación y confianza | US23-US27 |
| EP06 | Soporte y mejora continua | US28-US30 |

EP01 conserva el nombre del informe para mantener la trazabilidad; aquí solo se incluyen sus requisitos aplicables a la aplicación web: acceso público, consulta y búsqueda de ofertas, términos e idioma.

## Matriz de trazabilidad de requisitos (RTM)

La evidencia indica dónde se expresa el requisito en el código; no representa una certificación de cumplimiento ni resultados de pruebas. **Local**: lógica del prototipo en el navegador. **Parcial**: cobertura limitada al prototipo, sin envío externo de notificaciones ni servicios permanentes. JSON Server y los entornos están configurados; el frontend aún no consume la fake API.

| ID | Requisito | Épica | Contexto | Elementos relacionados | Alcance actual |
|---|---|---|---|---|---|
| US02 | Acceder a ofertas disponibles | EP01 | `offers / shared` | `Catalog`, `OfferService`, `OfferDetail`, `SessionService`. | Local |
| US03 | Explorar ofertas vigentes | EP01 | `offers` | `Offer`, `OfferService.active`, `Catalog`, `OfferCard`, `BusinessService`. | Local |
| US04 | Encontrar ofertas según necesidades | EP01 | `offers / shared` | `Catalog.results`, `GeolocationService`, `BusinessService`. | Local |
| US05 | Consultar condiciones de una oferta | EP01 | `offers / businesses` | `OfferDetail`, `OfferData`, `BusinessService`, `BrowserImageStorage`. | Local |
| US06 | Conocer términos y tratamiento de datos | EP01 | `shared` | `Legal`, rutas `terms` y `privacy`; contenido del prototipo. | Parcial |
| US07 | Elegir idioma | EP01 | `shared` | `LanguageService`, `LanguageSwitcher`, `LocalizedFormatPipe`, `public/i18n`. | Local |
| US08 | Registrar un establecimiento | EP02 | `businesses / iam` | `Business`, `BusinessService.save`, `BusinessProfile`, `SessionService`. | Local |
| US09 | Publicar una oferta de excedentes | EP02 | `offers / businesses` | `Offer.validate`, `OfferService.save`, `OfferEditor`, `BusinessService`. | Local |
| US10 | Reservar unidades disponibles | EP02 | `reservations / offers` | `ReservationService.create`, `Offer.allocate`, `ReservationData`. | Local |
| US11 | Confirmar la entrega de una reserva | EP02 | `reservations` | `Reservation.collect`, `ReservationService.confirmPickup`, `Reservations`. | Local |
| US12 | Consultar y cancelar reservas propias | EP02 | `reservations / offers` | `Reservation.cancel`, `ReservationService.mine/cancel`, `Offer.release`. | Local |
| US13 | Crear una cuenta de cliente | EP03 | `iam` | `Account`, `AccountRepository`, `SessionService.signUp`, `Auth`. | Local |
| US14 | Autenticarse y gestionar la sesión | EP03 | `iam` | `SessionService.signIn/signOut/require`, `sessionGuard`, `ownerGuard`, `Auth`. | Local |
| US15 | Mantener datos del cliente | EP03 | `iam` | `SessionService.updateProfile`, `Profile`, `AccountRepository`. | Local |
| US16 | Mantener datos del establecimiento | EP03 | `businesses` | `BusinessService.save`, `BusinessProfile`, `BusinessRepository`. | Local |
| US17 | Consultar información pública del negocio | EP03 | `businesses` | `BusinessProfile`, `BusinessService.get`, ruta `businesses/:id`. | Local |
| US18 | Corregir una oferta propia | EP04 | `offers` | `OfferService.save`, `Offer.validate`, `OfferEditor`. | Local |
| US19 | Suspender nuevas reservas de una oferta | EP04 | `offers / notifications` | `OfferService.pause`, `ManageOffers`, `Notification`. | Local |
| US20 | Conocer reservas pendientes del negocio | EP04 | `reservations / businesses` | `ReservationService.businessReservations`, `Reservations`, `BusinessService.owned`. | Local |
| US21 | Conocer nuevas reservas del negocio | EP04 | `notifications / reservations` | `ReservationService.create`, `NotificationService.mine/markRead`, `Notifications`. | Parcial |
| US22 | Consultar historial de recojos | EP04 | `businesses / reservations` | `ReportingService.rows`, `ReservationService.businessReservations`, `Dashboard`. | Local |
| US23 | Obtener confirmación de reserva | EP05 | `reservations / notifications` | `ReservationService.create`, `Reservations`, `NotificationService`. | Parcial |
| US24 | Recordar un recojo próximo a vencer | EP05 | `notifications / reservations` | `NotificationService`, `ClockService`; evaluación local durante la ejecución de la app. | Parcial |
| US25 | Conocer cambios de una oferta reservada | EP05 | `notifications / offers` | `OfferService.pause/save`, `NotificationService`, `Reservations`. | Parcial |
| US26 | Reconocer el vencimiento de una oferta | EP05 | `offers` | `Offer.status/isReservable`, `OfferService`, `ClockService`. | Local |
| US27 | Continuar una búsqueda sin resultados | EP05 | `offers` | `Catalog.results/clear`. | Local |
| US28 | Solicitar apoyo sobre una operación | EP06 | `feedback` | `FeedbackService.request`, `SupportRequest`, `Support`. | Local |
| US29 | Calificar una experiencia de recojo | EP06 | `feedback / reservations` | `FeedbackService.review`, `validateRating`, `Review`, `Reservations`. | Local |
| US30 | Evaluar resultados del negocio | EP06 | `businesses` | `ReportingService.summary/rows`, `Dashboard`, `OfferService`, `ReservationService`. | Local |

## Reglas operativas de referencia

- Una oferta tiene precio reducido positivo y menor que el original, unidades enteras positivas y una ventana válida de recojo.
- Un cliente reserva unidades disponibles de una oferta vigente; el código identifica la reserva y los precios se conservan al confirmar.
- La cancelación local se permite para una reserva activa antes del inicio de recojo; devuelve unidades sin superar el stock inicial.
- La confirmación exige una reserva del negocio responsable, activa y dentro de su ventana de recojo.
- La edición local se bloquea cuando existen reservas activas. Pausar impide nuevas reservas y conserva las anteriores.
- Los avisos actuales son internos. Las preferencias de correo y push no constituyen un servicio de envío implementado.
- El conteo de ofertas del resumen actual es total; el período filtra las reservas. Una métrica de ofertas publicadas durante un período requeriría registrar su fecha de publicación.

La fake API local aporta datos de muestra para el desarrollo. Los contratos del backend y sus garantías de autenticación y consistencia quedan fuera de estas historias del frontend.

## Historias de usuario

---

## US02: Acceder a ofertas disponibles

**Épica:** EP01  
**Contexto:** `offers / shared`  
**Alcance actual:** Local

**Descripción:**

Como visitante, quiero consultar las ofertas disponibles sin registrarme para evaluar las opciones antes de crear una cuenta.

**Criterios de aceptación:**

- **AC2.1:** Dado un visitante sin sesión, cuando solicita consultar ofertas, entonces el sistema permite acceder a la información pública de las ofertas vigentes.
- **AC2.2:** Dado un visitante que decide reservar, cuando solicita una reserva, entonces el sistema requiere una cuenta de cliente autenticada antes de crearla.

---

## US03: Explorar ofertas vigentes

**Épica:** EP01  
**Contexto:** `offers`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero conocer las ofertas vigentes de alimentos para identificar excedentes disponibles a precio reducido.

**Criterios de aceptación:**

- **AC3.1:** Dadas ofertas de negocios activos, cuando el cliente consulta las ofertas vigentes, entonces obtiene negocio, producto, precio original, precio reducido, unidades, ubicación y hora límite.
- **AC3.2:** Dada una oferta vencida o pausada, cuando se consultan ofertas vigentes, entonces esa oferta no se ofrece como reservable.
- **AC3.3:** Dada una oferta sin unidades, cuando se solicita reservarla, entonces el sistema rechaza la reserva.

---

## US04: Encontrar ofertas según necesidades

**Épica:** EP01  
**Contexto:** `offers / shared`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero buscar ofertas por ubicación, categoría y horario de recojo para encontrar opciones compatibles con mis necesidades.

**Criterios de aceptación:**

- **AC4.1:** Dados criterios de búsqueda combinados, cuando se consulta la disponibilidad, entonces cada resultado cumple todos los criterios seleccionados.
- **AC4.2:** Dado un criterio de distancia, cuando existe una ubicación autorizada del cliente, entonces el sistema calcula la distancia a los negocios y aplica el radio indicado.
- **AC4.3:** Dada una ubicación no disponible, cuando se solicita filtrar por distancia, entonces el sistema informa la limitación y permite continuar con otros criterios.

---

## US05: Consultar condiciones de una oferta

**Épica:** EP01  
**Contexto:** `offers / businesses`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero conocer el contenido, el precio y las condiciones de recojo de una oferta para decidir si me conviene reservarla.

**Criterios de aceptación:**

- **AC5.1:** Dada una oferta existente, cuando se solicita su información, entonces se obtienen descripción, precios, unidades, ingredientes o alérgenos declarados, negocio, dirección y ventana de recojo.
- **AC5.2:** Dada información de alérgenos no declarada, cuando se consulta la oferta, entonces el sistema no afirma que el alimento está libre de alérgenos.
- **AC5.3:** Dado un identificador inexistente, cuando se solicita la oferta, entonces el sistema informa que no está disponible.

---

## US06: Conocer términos y tratamiento de datos

**Épica:** EP01  
**Contexto:** `shared`  
**Alcance actual:** Parcial

**Descripción:**

Como visitante, quiero consultar las condiciones de uso y el tratamiento de mis datos para decidir de manera informada si utilizaré FoodSave.

**Criterios de aceptación:**

- **AC6.1:** Dado un visitante sin sesión, cuando solicita los términos de uso o la política de privacidad, entonces puede consultar el documento correspondiente.
- **AC6.2:** Dadas condiciones de uso publicadas, cuando se consultan, entonces se describen las responsabilidades de las partes y las condiciones aplicables a reservas y recojos.

---

## US07: Elegir idioma

**Épica:** EP01  
**Contexto:** `shared`  
**Alcance actual:** Local

**Descripción:**

Como usuario, quiero recibir la información del sistema en español o inglés para comprender las operaciones y sus resultados.

**Criterios de aceptación:**

- **AC7.1:** Dado uno de los idiomas admitidos, cuando el usuario lo elige, entonces las etiquetas, opciones y mensajes del sistema usan ese idioma.
- **AC7.2:** Dada una preferencia de idioma guardada, cuando el usuario continúa navegando o vuelve a abrir la aplicación, entonces se recupera la preferencia.
- **AC7.3:** Dados textos aportados por un negocio, cuando se cambia el idioma del sistema, entonces se conserva su contenido original.

---

## US08: Registrar un establecimiento

**Épica:** EP02  
**Contexto:** `businesses / iam`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero registrar mi establecimiento y sus condiciones de recojo para ofrecer excedentes en nombre de mi local.

**Criterios de aceptación:**

- **AC8.1:** Dado un responsable autenticado, cuando proporciona nombre, dirección, distrito, contacto, coordenadas y condiciones de recojo válidos, entonces el sistema registra un negocio asociado a su cuenta.
- **AC8.2:** Dados campos obligatorios incompletos o coordenadas inválidas, cuando se solicita el registro, entonces el sistema lo rechaza e informa qué debe corregirse.
- **AC8.3:** Dada una cuenta sin rol de responsable de negocio, cuando solicita registrar un establecimiento, entonces el sistema deniega la operación.

---

## US09: Publicar una oferta de excedentes

**Épica:** EP02  
**Contexto:** `offers / businesses`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero publicar los excedentes de mi establecimiento con precio, cantidad y condiciones de recojo para recuperar parte de su valor.

**Criterios de aceptación:**

- **AC9.1:** Dado un negocio del responsable autenticado y datos válidos, cuando se publica una oferta, entonces se registra como activa con unidades y ventana de recojo.
- **AC9.2:** Dado un precio reducido no positivo o no menor que el precio original, o unidades no enteras positivas, cuando se publica, entonces el sistema rechaza la oferta e informa la regla incumplida.
- **AC9.3:** Dada una ventana inválida o ya vencida, cuando se publica, entonces se rechaza; la expiración no puede superar el fin de recojo.

---

## US10: Reservar unidades disponibles

**Épica:** EP02  
**Contexto:** `reservations / offers`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero reservar unidades de una oferta vigente para asegurar su disponibilidad antes de acudir al establecimiento.

**Criterios de aceptación:**

- **AC10.1:** Dado un cliente autenticado y una cantidad entera positiva disponible, cuando confirma una reserva, entonces se registra la reserva, se reduce el stock y se asigna un código único con horario de recojo.
- **AC10.2:** Dada una oferta vencida, pausada o con stock insuficiente, cuando se intenta reservar, entonces no se crea una reserva ni se altera el stock.
- **AC10.3:** Dada una reserva creada, cuando se consultan sus importes, entonces conserva los precios y la cantidad confirmados al momento de reservar.

---

## US11: Confirmar la entrega de una reserva

**Épica:** EP02  
**Contexto:** `reservations`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero validar el código de recojo de una reserva de mi establecimiento para registrar la entrega correctamente.

**Criterios de aceptación:**

- **AC11.1:** Dado un código de reserva activa del propio negocio dentro de la ventana de recojo, cuando se confirma la entrega, entonces la reserva pasa a recogida y registra la fecha de entrega.
- **AC11.2:** Dado un código inexistente, vencido, cancelado o de otro negocio, cuando se intenta confirmar, entonces se rechaza la operación.
- **AC11.3:** Dada una reserva ya recogida, cuando se presenta nuevamente su código, entonces no se repite la confirmación.

---

## US12: Consultar y cancelar reservas propias

**Épica:** EP02  
**Contexto:** `reservations / offers`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero consultar y cancelar mis reservas según las condiciones permitidas para gestionar mis pedidos.

**Criterios de aceptación:**

- **AC12.1:** Dado un cliente autenticado, cuando consulta sus reservas, entonces obtiene únicamente sus pedidos con estado, cantidad, código, precios y condiciones de recojo.
- **AC12.2:** Dada una reserva propia activa antes del inicio del recojo, cuando confirma la cancelación, entonces pasa a cancelada y devuelve sus unidades disponibles sin exceder el stock inicial.
- **AC12.3:** Dada una reserva ajena, finalizada o cuyo recojo ya comenzó, cuando se solicita cancelarla, entonces se rechaza la operación y se conserva su estado.

---

## US13: Crear una cuenta de cliente

**Épica:** EP03  
**Contexto:** `iam`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero crear una cuenta con mis datos y credenciales para identificarme y gestionar mis reservas.

**Criterios de aceptación:**

- **AC13.1:** Dados nombre, correo válido, contraseña de al menos ocho caracteres y rol de cliente, cuando se solicita el registro, entonces el sistema crea una cuenta con identificador único.
- **AC13.2:** Dado un correo ya registrado sin distinguir mayúsculas y minúsculas, cuando se solicita otra cuenta con ese correo, entonces se rechaza el duplicado.
- **AC13.3:** Dados datos incompletos o inválidos, cuando se solicita el registro, entonces se informan las reglas incumplidas y no se crea la cuenta.

---

## US14: Autenticarse y gestionar la sesión

**Épica:** EP03  
**Contexto:** `iam`  
**Alcance actual:** Local

**Descripción:**

Como usuario registrado, quiero iniciar y cerrar mi sesión para utilizar las funciones permitidas a mi cuenta.

**Criterios de aceptación:**

- **AC14.1:** Dadas credenciales válidas, cuando se solicita acceso, entonces se establece una sesión que identifica la cuenta y su rol.
- **AC14.2:** Dadas credenciales incorrectas, cuando se solicita acceso, entonces no se establece una sesión y se comunica el rechazo sin exponer las credenciales guardadas.
- **AC14.3:** Dada una sesión activa, cuando el usuario la cierra, entonces las siguientes operaciones protegidas requieren nuevamente autenticación.

---

## US15: Mantener datos del cliente

**Épica:** EP03  
**Contexto:** `iam`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero actualizar mis datos de identificación y contacto para mantener vigente la información de mi cuenta.

**Criterios de aceptación:**

- **AC15.1:** Dado un cliente autenticado, cuando actualiza su nombre y teléfono con datos permitidos, entonces se guardan los cambios en su cuenta y sesión.
- **AC15.2:** Dado un nombre vacío, cuando se solicita actualizar el perfil, entonces el sistema rechaza el cambio.
- **AC15.3:** Dada una solicitud de actualización, cuando se procesa, entonces no permite cambiar el identificador ni elevar el rol mediante esa operación.

---

## US16: Mantener datos del establecimiento

**Épica:** EP03  
**Contexto:** `businesses`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero mantener actualizados los datos y condiciones de mi establecimiento para que sus ofertas presenten información correcta.

**Criterios de aceptación:**

- **AC16.1:** Dado un negocio propio, cuando su responsable actualiza datos válidos, entonces se conserva su identidad y se actualiza la información pública.
- **AC16.2:** Dados datos obligatorios inválidos, cuando se solicita el cambio, entonces el sistema lo rechaza.
- **AC16.3:** Dado un negocio de otro responsable, cuando se solicita modificarlo, entonces el sistema deniega la operación.

---

## US17: Consultar información pública del negocio

**Épica:** EP03  
**Contexto:** `businesses`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero conocer la ubicación y las condiciones del establecimiento para evaluar la conveniencia del recojo.

**Criterios de aceptación:**

- **AC17.1:** Dado un establecimiento existente, cuando se solicita su información pública, entonces se obtienen nombre, dirección, distrito, ubicación, contacto y condiciones de recojo.
- **AC17.2:** Dado un visitante sin sesión, cuando consulta información pública del negocio, entonces no se requiere autenticación.
- **AC17.3:** Dada una consulta pública, cuando se responde, entonces no se exponen credenciales de la cuenta propietaria.

---

## US18: Corregir una oferta propia

**Épica:** EP04  
**Contexto:** `offers`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero corregir los datos de una oferta propia antes de comprometer unidades reservadas para mantener condiciones de venta correctas.

**Criterios de aceptación:**

- **AC18.1:** Dada una oferta propia sin reservas activas y datos válidos, cuando se solicita una actualización, entonces el sistema guarda las nuevas condiciones.
- **AC18.2:** Dada una oferta con reservas activas, cuando se solicita editar sus condiciones, entonces el sistema rechaza la edición para proteger los compromisos existentes.
- **AC18.3:** Dada una oferta ajena o datos inválidos, cuando se solicita modificarla, entonces no se guarda el cambio.

---

## US19: Suspender nuevas reservas de una oferta

**Épica:** EP04  
**Contexto:** `offers / notifications`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero pausar una oferta propia cuando no pueda atender nuevas solicitudes para evitar reservas adicionales.

**Criterios de aceptación:**

- **AC19.1:** Dada una oferta propia, cuando su responsable solicita pausarla, entonces se registra como pausada y deja de aceptar nuevas reservas.
- **AC19.2:** Dadas reservas activas previas, cuando se pausa la oferta, entonces se conservan sus registros y se comunica el cambio a sus clientes.
- **AC19.3:** Dada una oferta ajena, cuando se solicita pausarla, entonces se deniega la operación.

---

## US20: Conocer reservas pendientes del negocio

**Épica:** EP04  
**Contexto:** `reservations / businesses`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero consultar las reservas activas de mis ofertas para preparar los pedidos y organizar los recojos.

**Criterios de aceptación:**

- **AC20.1:** Dado un responsable autenticado, cuando consulta reservas pendientes, entonces obtiene únicamente reservas de sus establecimientos.
- **AC20.2:** Dadas reservas activas, cuando se consultan, entonces se identifican oferta, cantidad, estado, código y ventana de recojo.
- **AC20.3:** Dado un negocio sin reservas activas, cuando se consulta su actividad, entonces se informa que no hay pedidos pendientes.

---

## US21: Conocer nuevas reservas del negocio

**Épica:** EP04  
**Contexto:** `notifications / reservations`  
**Alcance actual:** Parcial

**Descripción:**

Como responsable de negocio, quiero recibir un aviso cuando se reserva una oferta de mi establecimiento para preparar el pedido oportunamente.

**Criterios de aceptación:**

- **AC21.1:** Dada una reserva creada correctamente, cuando se registra la operación, entonces se genera un aviso dirigido a la cuenta propietaria con oferta y cantidad.
- **AC21.2:** Dada una cuenta autenticada, cuando consulta sus avisos, entonces solo obtiene los que le corresponden.
- **AC21.3:** Dado un aviso pendiente de lectura, cuando su destinatario lo reconoce, entonces se registra su lectura sin modificar la reserva.

---

## US22: Consultar historial de recojos

**Épica:** EP04  
**Contexto:** `businesses / reservations`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero consultar las reservas recogidas, canceladas y vencidas de un período para comprender la actividad de mis establecimientos.

**Criterios de aceptación:**

- **AC22.1:** Dado un responsable autenticado y un período, cuando consulta el historial, entonces obtiene reservas de sus establecimientos comprendidas en ese período.
- **AC22.2:** Dadas reservas finalizadas, cuando se consulta su resultado, entonces se distingue entre recogida, cancelada y vencida.
- **AC22.3:** Dado un período sin actividad, cuando se consulta, entonces se informa la ausencia de registros.

---

## US23: Obtener confirmación de reserva

**Épica:** EP05  
**Contexto:** `reservations / notifications`  
**Alcance actual:** Parcial

**Descripción:**

Como cliente comprador, quiero obtener la confirmación y el código de mi reserva para tener certeza de las condiciones del pedido.

**Criterios de aceptación:**

- **AC23.1:** Dada una reserva creada, cuando finaliza la operación, entonces el cliente puede consultar negocio, oferta, cantidad, importes, código y hora límite.
- **AC23.2:** Dada la misma operación, cuando se registran sus avisos, entonces se genera una confirmación dirigida al cliente.
- **AC23.3:** Dada una operación rechazada, cuando se informa su resultado, entonces no se presenta una reserva como confirmada.

---

## US24: Recordar un recojo próximo a vencer

**Épica:** EP05  
**Contexto:** `notifications / reservations`  
**Alcance actual:** Parcial

**Descripción:**

Como cliente comprador, quiero recibir un recordatorio antes de la hora límite de mi reserva para recogerla a tiempo.

**Criterios de aceptación:**

- **AC24.1:** Dada una reserva activa y recordatorios habilitados, cuando se aproxima su vencimiento según la política de aviso, entonces se genera un recordatorio asociado a esa reserva.
- **AC24.2:** Dada una reserva cancelada, recogida o vencida, cuando se evalúan recordatorios, entonces no se genera uno nuevo.
- **AC24.3:** Dado un recordatorio ya registrado, cuando se vuelve a evaluar la misma reserva, entonces no se duplica el aviso.

---

## US25: Conocer cambios de una oferta reservada

**Épica:** EP05  
**Contexto:** `notifications / offers`  
**Alcance actual:** Parcial

**Descripción:**

Como cliente comprador, quiero conocer los cambios que afectan una oferta reservada para decidir cómo gestionar mi pedido.

**Criterios de aceptación:**

- **AC25.1:** Dada una oferta reservada que se pausa, cuando el responsable confirma la pausa, entonces se registra un aviso para cada cliente con reserva activa afectada.
- **AC25.2:** Dada una reserva afectada, cuando el cliente consulta el aviso, entonces puede identificar la oferta y consultar las condiciones de su reserva.
- **AC25.3:** Dada una edición incompatible con reservas activas, cuando se solicita, entonces se rechaza el cambio y se conservan las condiciones confirmadas.

---

## US26: Reconocer el vencimiento de una oferta

**Épica:** EP05  
**Contexto:** `offers`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero conocer cuándo una oferta dejó de estar vigente para evitar solicitar una reserva que ya no puede atenderse.

**Criterios de aceptación:**

- **AC26.1:** Dada una oferta cuya fecha de expiración ya pasó, cuando se evalúa su disponibilidad, entonces se considera vencida.
- **AC26.2:** Dada una oferta vencida, cuando se intenta reservar, entonces se rechaza la operación incluso si el cliente conserva información anterior.
- **AC26.3:** Dada una consulta de ofertas vigentes, cuando se prepara el resultado, entonces no se incluye una oferta vencida como disponible.

---

## US27: Continuar una búsqueda sin resultados

**Épica:** EP05  
**Contexto:** `offers`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero conocer alternativas cuando una búsqueda no encuentra ofertas para continuar explorando opciones.

**Criterios de aceptación:**

- **AC27.1:** Dados criterios sin coincidencias, cuando termina la consulta, entonces se informa que no hay ofertas que los cumplan.
- **AC27.2:** Dada una búsqueda sin resultados, cuando el cliente solicita retirar restricciones, entonces se permite limpiar los criterios y repetir la consulta.
- **AC27.3:** Dados nuevos criterios, cuando se consulta nuevamente, entonces se presentan los resultados correspondientes sin conservar filtros retirados.

---

## US28: Solicitar apoyo sobre una operación

**Épica:** EP06  
**Contexto:** `feedback`  
**Alcance actual:** Local

**Descripción:**

Como usuario, quiero registrar una solicitud de ayuda sobre ofertas, reservas o recojos para comunicar una duda o incidencia con su contexto.

**Criterios de aceptación:**

- **AC28.1:** Dado un usuario autenticado y asunto y descripción completos, cuando solicita ayuda, entonces se registra una solicitud abierta asociada a su cuenta.
- **AC28.2:** Dada una reserva vinculada a la solicitud, cuando se registra el caso, entonces se comprueba que pertenece al cliente o al negocio del solicitante.
- **AC28.3:** Dados datos incompletos o una reserva ajena, cuando se solicita ayuda, entonces no se registra el caso y se comunica la corrección necesaria.

---

## US29: Calificar una experiencia de recojo

**Épica:** EP06  
**Contexto:** `feedback / reservations`  
**Alcance actual:** Local

**Descripción:**

Como cliente comprador, quiero calificar una reserva que ya recogí para aportar retroalimentación sobre mi experiencia.

**Criterios de aceptación:**

- **AC29.1:** Dada una reserva propia recogida y una puntuación entera de uno a cinco, cuando se registra la opinión, entonces queda asociada a esa reserva con comentario y fecha.
- **AC29.2:** Dada una reserva ajena o todavía no recogida, cuando se solicita calificarla, entonces se rechaza la operación.
- **AC29.3:** Dada una reserva que ya tiene calificación, cuando se solicita una segunda, entonces se evita el duplicado y no se modifica el estado de la reserva.

---

## US30: Evaluar resultados del negocio

**Épica:** EP06  
**Contexto:** `businesses`  
**Alcance actual:** Local

**Descripción:**

Como responsable de negocio, quiero conocer los resultados de ofertas, reservas y recojos de un período para evaluar el aprovechamiento de excedentes.

**Criterios de aceptación:**

- **AC30.1:** Dado un responsable autenticado y un período, cuando solicita resultados, entonces se calculan indicadores usando solo actividad de sus establecimientos.
- **AC30.2:** Dadas reservas recogidas, cuando se calculan unidades e importes recuperados, entonces se usa la cantidad y el precio confirmados en cada reserva.
- **AC30.3:** Dadas reservas canceladas o vencidas, cuando se calculan importes recuperados por entrega, entonces no se cuentan como ventas recogidas.
