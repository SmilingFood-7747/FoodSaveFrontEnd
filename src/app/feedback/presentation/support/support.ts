import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { FeedbackService } from '../../application/feedback.service';
import { SessionService } from '../../../iam/application/session.service';
import { ReservationService } from '../../../reservations/application/reservation.service';
@Component({
  selector: 'app-support',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './support.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './support.css',
})
export class Support {
  readonly busy = signal(false);
  readonly feedback = inject(FeedbackService);
  readonly session = inject(SessionService);
  readonly reservations = inject(ReservationService);
  readonly subject = signal('');
  readonly description = signal('');
  readonly reservationId = signal(0);
  readonly message = signal('');
  readonly error = signal('');
  async send(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.feedback.request(
        this.subject(),
        this.description(),
        this.reservationId() || undefined,
      );
      this.subject.set('');
      this.description.set('');
      this.message.set('support.saved');
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
}
