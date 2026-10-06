# Planes e ingresos de FoodSave

## Acceso

- `/admin`: panel de administrador con ventas por recojos, comisiones, suscripciones, descuentos y balance estimado.
- `/plans`: planes para clientes y negocios, selección mensual e historial de contrataciones.
- `/business/dashboard`: ventas brutas, comisiones, neto por establecimiento, mensualidades y reporte CSV.

Cuenta de administrador de demostración: `admin@gmail.com`, contraseña `FoodSave123!`. También está disponible en la opción Administrador del inicio de sesión. El registro público solo permite clientes y responsables de negocio.

## Clientes

| Plan         | Mensualidad | Descuento adicional          | Límite por ciclo |
| ------------ | ----------- | ---------------------------- | ---------------- |
| foodSaveFREE | S/0         | Sin descuento de suscripción | —                |
| foodSavePlus | S/9.90      | 5 %                          | S/15             |

El descuento se aplica sobre el precio de oferta y FoodSave cubre su coste. Los negocios conservan sus ventas antes de la comisión. Las reservas activas y recogidas consumen el presupuesto del ciclo; las canceladas y vencidas lo liberan. El total se muestra antes de reservar y se conserva en el historial.

## Negocios

| Plan         | Mensualidad | Comisión por recojo confirmado | Ofertas activas por local | Beneficios                   |
| ------------ | ----------- | ------------------------------ | ------------------------- | ---------------------------- |
| foodSaveFREE | S/0         | 5 %                            | 5                         | Reservas, recojos e ingresos |
| foodSavePlus | S/29        | 7 %                            | 20                        | Reportes exportables a CSV   |

La comisión del plan foodSaveFREE se muestra en el desglose de ingresos y en los términos, sin incorporarla a la descripción de su tarjeta. La mensualidad se registra una vez por cuenta propietaria, aunque tenga varios establecimientos.

Una oferta existente se conserva cuando vence una suscripción. El límite se aplica a nuevas ofertas o a la reactivación de ofertas pausadas; se permite editar las ofertas ya activas.

## Ciclos y cálculos

foodSaveFREE es el plan predeterminado. Un plan de pago tiene vigencia de un mes calendario y vuelve a foodSaveFREE al vencer. Si cambia de plan durante un ciclo, conserva sus beneficios hasta el vencimiento y guarda su elección para la renovación manual; no se genera otro pago durante ese cambio.

Cada reserva conserva el porcentaje y el importe de comisión de su creación. Un cambio de plan solo afecta nuevas reservas. Las comisiones se reconocen únicamente en recojos confirmados, usando la fecha de recojo para filtrar el periodo. Los cálculos monetarios se redondean a céntimos por reserva.

Balance de FoodSave = comisiones + contrataciones de suscripción − descuentos de clientes. La proyección mensual de suscripciones activas se muestra por separado del historial de contrataciones. El neto del propietario resta las comisiones y las mensualidades registradas en el periodo.

## Datos del frontend

Las suscripciones y contrataciones se guardan en el navegador y están representadas en `db.json` mediante `/subscriptions` y `/subscriptionCharges`. El frontend aún no consume JSON Server. Las contrataciones son simuladas y no realizan cobros, transferencias ni renovaciones automáticas. Los datos no se sincronizan entre dispositivos y los roles se controlan en el frontend.

Las suscripciones del antiguo plan Pro pasan a foodSavePlus conservando su fecha de vencimiento. El historial conserva los importes y planes originales de las contrataciones, sin generar un cobro nuevo.
