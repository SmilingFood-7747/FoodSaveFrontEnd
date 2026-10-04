import { ReservationData } from '../domain/model/reservation';

export function createDemoReservations(now: number): ReservationData[] {
  const time = (minutes: number) => new Date(now + minutes * 60000).toISOString();
  const reservations: ReservationData[] = [
    {
      id: 1,
      offerId: 1,
      customerUserId: 1,
      quantity: 1,
      unitPrice: 16,
      originalUnitPrice: 32,
      pickupCode: 'FS-DEMO01',
      pickupStartAt: time(-120),
      pickupDeadlineAt: time(-30),
      status: 'COLLECTED',
      createdAt: time(-150),
      collectedAt: time(-60),
    },
  ];
  return reservations;
}
