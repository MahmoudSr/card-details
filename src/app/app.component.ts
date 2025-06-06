import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardComponent } from './card/card.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'card-details';
  cardName = signal('');
  cardNumber = signal('');
  cardDate = signal('');
  cardCVV = signal('');
  fb = inject(FormBuilder);
  cardForm!: FormGroup;

  ngOnInit(): void {
    this.cardForm = this.fb.group({
      card_number: ['', Validators.required],
      card_date: ['', Validators.required],
      card_name: ['', Validators.required],
      card_cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });

    this.cardForm.get('card_number')?.valueChanges.subscribe((value) => {
      if (value != null) {
        const raw = value.replace(/\D/g, '').slice(0, 16); // clean + limit digits
        const formatted = this.formatCardNumber(raw);

        if (value !== formatted) {
          // Avoid infinite loop with emitEvent: false
          this.cardForm
            .get('card_number')
            ?.setValue(formatted, { emitEvent: false });
        }

        this.cardNumber.set(formatted);
      }
    });

    let previousRawDate = '';

    this.cardForm.get('card_date')?.valueChanges.subscribe((value: string) => {
      const clean = (value || '').replace(/\D/g, '').slice(0, 4); // keep only 4 digits

      // Determine if user is deleting
      const isDeleting = clean.length < previousRawDate.length;

      // Let deletion happen naturally without interference
      if (isDeleting) {
        previousRawDate = clean;
        this.cardDate.set(value || '00/00');
        return;
      }

      // Format forward typing
      let formatted = clean;
      if (clean.length >= 3) {
        let month = parseInt(clean.slice(0, 2), 10);
        if (month < 1) month = 1;
        if (month > 12) month = 12;
        const paddedMonth = month.toString().padStart(2, '0');
        const year = clean.slice(2);
        formatted = `${paddedMonth}/${year}`;
      } else if (clean.length >= 2) {
        formatted = `${clean.slice(0, 2)}`;
      }

      previousRawDate = clean;

      if (value !== formatted) {
        this.cardForm
          .get('card_date')
          ?.setValue(formatted, { emitEvent: false });
      }

      this.cardDate.set(formatted || '00/00');
    });

    this.cardForm.get('card_name')?.valueChanges.subscribe((value: string) => {
      // Allow only letters and spaces
      const clean = (value || '').replace(/[^a-zA-Z\s]/g, '');

      if (value !== clean) {
        this.cardForm.get('card_name')?.setValue(clean, { emitEvent: false });
      }

      this.cardName.set(clean || 'Mahmoud Srouji');
    });

    this.cardForm.get('card_cvv')?.valueChanges.subscribe((value: string) => {
      const clean = (value || '').replace(/\D/g, '').slice(0, 3); // Only digits, max 4

      if (value !== clean) {
        this.cardForm.get('card_cvv')?.setValue(clean, { emitEvent: false });
      }

      this.cardCVV.set(clean || '•••');
    });
  }

  formatCardNumber(value: string): string {
    return value
      .replace(/\D/g, '') // remove non-digits
      .slice(0, 16) // max 16 digits
      .replace(/(.{4})/g, '$1 ') // insert space every 4 digits
      .trim();
  }
}
