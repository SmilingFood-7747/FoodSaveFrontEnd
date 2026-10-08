export interface Notification {
  id: number;
  recipientAccountId: number;
  reservationId?: number;
  offerId?: number;
  distanceKm?: number;
  offerVersion?: string;
  type:
    | 'NEARBY_OFFER'
    | 'NEW_RESERVATION'
    | 'RESERVATION_CONFIRMED'
    | 'PICKUP_REMINDER'
    | 'OFFER_CHANGED'
    | 'RESERVATION_CANCELLED';
  titleKey: string;
  body: string;
  createdAt: string;
  readAt?: string;
}
export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  remindersEnabled: boolean;
  nearbyOffersEnabled?: boolean;
}
