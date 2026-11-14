import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { UI } from '../../ui';
import { RouterOutlet } from '@angular/router';
import { ApiDatabase } from '../../../infrastructure/api-database';
import { BackendCatalogApi } from '../../../infrastructure/backend-catalog.api';
import { SessionService } from '../../../../iam/application/session.service';
@Component({
  selector: 'app-content',
  encapsulation: ViewEncapsulation.None,
  imports: [...UI, RouterOutlet],
  templateUrl: './content.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content.css',
})
export class Content {
  readonly database = inject(ApiDatabase);
  private readonly catalog = inject(BackendCatalogApi);
  private readonly session = inject(SessionService);

  async refresh(): Promise<void> {
    await this.database.refresh();
    await this.catalog.refresh(this.session.user(), this.session.accessToken);
  }
}
