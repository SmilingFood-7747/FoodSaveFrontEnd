import { computed, inject, Injectable } from '@angular/core';
import { Business } from '../domain/model/business';
import { BusinessRepository } from '../domain/repositories/business.repository';
import { SessionService } from '../../iam/application/session.service';
import { ApiDatabase } from '../../shared/infrastructure/api-database';
import { DomainError } from '../../shared/domain/model/domain-error';
@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly repository = inject(BusinessRepository);
  private readonly session = inject(SessionService);
  private readonly db = inject(ApiDatabase);
  readonly all = computed(() => this.repository.all());
  readonly owned = computed(() =>
    this.all().filter((b) => b.ownerAccountId === this.session.user()?.id),
  );
  get(id: number): Business | undefined {
    return this.all().find((b) => b.id === id);
  }
  async save(
    data: Omit<Business, 'id' | 'ownerAccountId' | 'isActive' | 'plusPartner'>,
    id?: number,
  ): Promise<Business> {
    const owner = this.session.require('BUSINESS_OWNER');
    if (
      ![data.name, data.address, data.district, data.contactPhone, data.pickupConditions].every(
        (v) => v.trim(),
      ) ||
      !Number.isFinite(data.latitude) ||
      !Number.isFinite(data.longitude) ||
      Math.abs(data.latitude) > 90 ||
      Math.abs(data.longitude) > 180
    )
      throw new DomainError('errors.business');
    if (id && this.get(id)?.ownerAccountId !== owner.id) throw new DomainError('errors.forbidden');
    const business = {
      ...data,
      id: id ?? this.db.nextId(this.all()),
      ownerAccountId: owner.id,
      isActive: true,
      plusPartner: id ? (this.get(id)?.plusPartner ?? false) : false,
    };
    await this.repository.save(business);
    return business;
  }
}
