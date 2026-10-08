import { Business } from '../domain/model/business';

export function createDemoBusinesses(): Business[] {
  const businesses: Business[] = [
    {
      id: 1,
      plusPartner: true,
      ownerAccountId: 2,
      name: 'La Mesa Verde',
      district: 'Miraflores',
      address: 'Av. José Larco 480',
      latitude: -12.122,
      longitude: -77.03,
      contactPhone: '999333444',
      pickupConditions: 'Trae tu código de recojo. Recoge en el mostrador.',
      isActive: true,
    },
    {
      id: 2,
      ownerAccountId: 100,
      name: 'Pan de Barrio',
      district: 'San Isidro',
      address: 'Av. Petit Thouars 3500',
      latitude: -12.094,
      longitude: -77.027,
      contactPhone: '999444555',
      pickupConditions: 'Trae una bolsa reutilizable y muestra tu código.',
      isActive: true,
    },
    {
      id: 3,
      ownerAccountId: 101,
      name: 'Sazón Limeña',
      district: 'San Miguel',
      address: 'Av. La Marina 1700',
      latitude: -12.079,
      longitude: -77.092,
      contactPhone: '999555666',
      pickupConditions: 'Recoge en la recepción dentro del horario indicado.',
      isActive: true,
    },
    {
      id: 4,
      plusPartner: true,
      ownerAccountId: 102,
      name: 'Verde y Fresco',
      district: 'Barranco',
      address: 'Av. Grau 250',
      latitude: -12.143,
      longitude: -77.023,
      contactPhone: '999777888',
      pickupConditions: 'Muestra tu código en el mostrador.',
      isActive: true,
    },
  ];
  return businesses;
}
