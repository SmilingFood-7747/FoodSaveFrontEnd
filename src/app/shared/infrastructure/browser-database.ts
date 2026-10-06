import { Injectable, signal } from '@angular/core';
import { Account } from '../../iam/domain/model/account';
import { Business } from '../../businesses/domain/model/business';
import { OfferData } from '../../offers/domain/model/offer';
import { ReservationData } from '../../reservations/domain/model/reservation';
import {
  Notification,
  NotificationPreferences,
} from '../../notifications/domain/model/notification';
import { Review, SupportRequest } from '../../feedback/domain/model/review';
import {
  cents,
  money,
  Subscription,
  SubscriptionCharge,
} from '../../billing/domain/model/subscription';
import { demoSeed } from './demo-seed';
export interface LocalDatabase {
  subscriptions: Subscription[];
  subscriptionCharges: SubscriptionCharge[];
  accounts: Account[];
  businesses: Business[];
  offers: OfferData[];
  reservations: ReservationData[];
  notifications: Notification[];
  reviews: Review[];
  requests: SupportRequest[];
  preferences: Record<string, NotificationPreferences>;
}
@Injectable({ providedIn: 'root' })
export class BrowserDatabase {
  private readonly key = 'foodsave-demo-v1';
  readonly state = signal<LocalDatabase>(this.load());
  readonly storageError = signal(false);
  private load(): LocalDatabase {
    try {
      const storedData = localStorage.getItem(this.key);
      if (storedData) {
        const value = JSON.parse(storedData);
        if (
          Array.isArray(value.offers) &&
          Array.isArray(value.accounts) &&
          Array.isArray(value.reservations) &&
          Array.isArray(value.businesses) &&
          Array.isArray(value.notifications) &&
          Array.isArray(value.reviews) &&
          Array.isArray(value.requests)
        ) {
          let database: LocalDatabase = { ...value, preferences: value.preferences ?? {} };
          database = this.upgradeDemoContent(database);
          database = this.upgradeDemoOffers(database);
          database = this.upgradeDemoAccounts(database);
          database = this.upgradeBilling(database);
          return database;
        }
      }
    } catch {}
    return demoSeed();
  }
  private upgradeDemoContent(value: LocalDatabase): LocalDatabase {
    const demo = demoSeed();
    const samples = demo.offers;
    const previousDemoText: Record<string, string> = {
      'Limeño lunch box': 'Almuerzo limeño',
      'Rice, grilled chicken and vegetables prepared today.':
        'Arroz, pollo a la parrilla y verduras preparados hoy.',
      'Bakery surprise bag': 'Bolsa de panadería',
      'Bakery bag': 'Bolsa de panadería',
      'A selection of bread and pastries from today.':
        'Una selección de panes y productos de panadería de hoy.',
      'Garden bowl': 'Bowl de la huerta',
      'Seasonal vegetables, quinoa and house dressing.':
        'Verduras de temporada, quinua y aliño de la casa.',
      'Traditional lunch': 'Almuerzo tradicional',
      'A generous serving of a Peruvian home-style lunch.':
        'Una porción generosa de almuerzo casero peruano.',
      'Sweet afternoon box': 'Caja de postre',
      'Dessert box': 'Caja de postre',
      'Two desserts selected from today’s display.':
        'Dos postres seleccionados de la vitrina de hoy.',
      'Roasted vegetable plate': 'Plato de verduras al horno',
      'Freshly roasted vegetables with rice and herbs.':
        'Verduras recién horneadas con arroz y hierbas.',
      'Evening rescue box': 'Caja de rescate para la noche',
      'A prepared meal selected by the kitchen.':
        'Una comida preparada seleccionada por la cocina.',
      'House dessert': 'Postre de la casa',
      'A daily dessert; check availability with the team.':
        'Un postre del día; consulta la disponibilidad con el equipo.',
      Milk: 'Leche',
      'Gluten, eggs, milk': 'Gluten, huevos, leche',
      Nuts: 'Frutos secos',
      'Milk, eggs': 'Leche, huevos',
      'Ask the restaurant': 'Consulta al restaurante',
      'None declared; ask about cross-contact':
        'Ninguno declarado; consulta sobre el contacto cruzado',
      'Bring your pickup code. Collect at the counter.':
        'Trae tu código de recojo. Recoge en el mostrador.',
      'Bring a reusable bag and show your code.':
        'Trae una bolsa reutilizable y muestra tu código.',
      'Collect at the front desk during the pickup window.':
        'Recoge en la recepción dentro del horario indicado.',
      'Show your code at the counter.': 'Muestra tu código en el mostrador.',
    };
    let changed = false;
    value.offers = value.offers.filter((offer) => {
      if (offer.id !== 7 || offer.businessId !== 4 || offer.title !== 'Evening rescue box')
        return true;
      const hasReservations = value.reservations.some(
        (reservation) => reservation.offerId === offer.id,
      );
      if (hasReservations) {
        if (offer.status !== 'PAUSED') {
          offer.status = 'PAUSED';
          changed = true;
        }
        return true;
      }
      changed = true;
      return false;
    });
    for (const offer of value.offers) {
      const sample = samples.find((item) => item.id === offer.id);
      if (!sample || offer.businessId !== sample.businessId) continue;
      if (previousDemoText[offer.title] === sample.title) {
        offer.title = sample.title;
        changed = true;
      }
      if (offer.title !== sample.title) continue;
      for (const field of ['description', 'allergens'] as const) {
        const text = previousDemoText[offer[field]];
        if (text) {
          offer[field] = text;
          changed = true;
        }
      }
      if (!sample.image) continue;
      const isAsset = offer.image?.startsWith('/assets/') || offer.image?.startsWith('assets/');
      if (offer.image && !isAsset) continue;
      if (offer.image === sample.image) continue;
      offer.image = sample.image;
      changed = true;
    }
    for (const business of value.businesses) {
      const sample = demo.businesses.find((item) => item.id === business.id);
      if (!sample || sample.name !== business.name) continue;
      const text = previousDemoText[business.pickupConditions];
      if (text) {
        business.pickupConditions = text;
        changed = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(this.key, JSON.stringify(value));
      } catch {}
    }
    return value;
  }
  private upgradeDemoAccounts(value: LocalDatabase): LocalDatabase {
    let changed = false;
    for (const account of value.accounts) {
      let email = account.email;
      if (account.email === 'cliente@foodsave.demo' && account.salt === 'foodsave-demo-customer') {
        email = 'cliente@gmail.com';
      }
      if (account.email === 'negocio@foodsave.demo' && account.salt === 'foodsave-demo-business') {
        email = 'negocio@gmail.com';
      }
      if (account.email === 'pan@foodsave.demo' && account.salt === 'foodsave-demo-bakery') {
        email = 'pan@gmail.com';
      }
      if (account.email === 'sazon@foodsave.demo' && account.salt === 'foodsave-demo-meals') {
        email = 'sazon@gmail.com';
      }
      if (account.email === 'verde@foodsave.demo' && account.salt === 'foodsave-demo-salad') {
        email = 'verde@gmail.com';
      }
      if (
        email === account.email ||
        value.accounts.some((item) => item.email.toLowerCase() === email)
      )
        continue;
      account.email = email;
      changed = true;
    }
    if (changed) {
      try {
        localStorage.setItem(this.key, JSON.stringify(value));
      } catch {}
    }
    return value;
  }
  private upgradeDemoOffers(value: LocalDatabase): LocalDatabase {
    const samples = demoSeed().offers;
    let changed = false;
    const offers = value.offers.map((offer) => {
      const sample = samples.find((item) => item.id === offer.id);
      const end = Date.parse(offer.pickupEndAt);
      const duration = end - Date.parse(offer.pickupStartAt);
      if (
        !sample ||
        offer.status !== 'ACTIVE' ||
        offer.businessId !== sample.businessId ||
        offer.title !== sample.title ||
        offer.description !== sample.description ||
        offer.category !== sample.category ||
        offer.originalPrice !== sample.originalPrice ||
        offer.offerPrice !== sample.offerPrice ||
        offer.initialUnits !== sample.initialUnits ||
        end - Date.parse(offer.expiresAt) !== 10 * 60000 ||
        ![150 * 60000, 195 * 60000].includes(duration) ||
        value.reservations.some((r) => r.offerId === offer.id && r.status === 'ACTIVE')
      )
        return offer;
      changed = true;
      return {
        ...offer,
        pickupStartAt: sample.pickupStartAt,
        pickupEndAt: sample.pickupEndAt,
        expiresAt: sample.expiresAt,
      };
    });
    if (!changed) return value;
    const next = { ...value, offers };
    try {
      localStorage.setItem(this.key, JSON.stringify(next));
    } catch {}
    return next;
  }
  private upgradeBilling(value: LocalDatabase): LocalDatabase {
    value.subscriptions ??= [];
    value.subscriptionCharges ??= [];
    if (!value.accounts.some((a) => a.role === 'ADMIN')) {
      const sample = demoSeed().accounts.find((a) => a.role === 'ADMIN')!;
      const email = value.accounts.some((a) => a.email.toLowerCase() === sample.email)
        ? 'admin+foodsave@gmail.com'
        : sample.email;
      value.accounts.push({ ...sample, id: this.nextId(value.accounts), email });
    }
    value.reservations = value.reservations.map((r) => ({
      ...r,
      businessId: r.businessId ?? value.offers.find((o) => o.id === r.offerId)?.businessId,
      commissionRate: r.commissionRate ?? 5,
      commissionAmount:
        r.commissionAmount ??
        money(Math.round((cents(r.unitPrice * r.quantity) * (r.commissionRate ?? 5)) / 100)),
      customerDiscountAmount: r.customerDiscountAmount ?? 0,
      customerPaidAmount: r.customerPaidAmount ?? money(cents(r.unitPrice * r.quantity)),
    }));
    return value;
  }
  commit(change: (current: LocalDatabase) => LocalDatabase): void {
    const next = change(structuredClone(this.state()));
    try {
      localStorage.setItem(this.key, JSON.stringify(next));
      this.storageError.set(false);
    } catch {
      this.storageError.set(true);
    }
    this.state.set(next);
  }
  nextId(items: { id: number }[]): number {
    let highestId = 0;
    for (const item of items) {
      if (item.id > highestId) highestId = item.id;
    }
    return highestId + 1;
  }
}
export function upsert<T extends { id: number }>(items: T[], item: T): T[] {
  return [...items.filter((current) => current.id !== item.id), item];
}
