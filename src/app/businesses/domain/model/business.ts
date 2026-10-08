export interface Business {
  id: number;
  ownerAccountId: number;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  pickupConditions: string;
  isActive: boolean;
  plusPartner?: boolean;
}
