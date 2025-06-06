import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  cardName = input('');
  cardDate = input('');
  cardNumber = input('');
  cardCVV = input('');
}
