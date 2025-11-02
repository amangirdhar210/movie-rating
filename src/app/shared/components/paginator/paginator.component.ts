import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-paginator',
  imports: [PaginatorModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  @Input() totalRecords: number = 0;
  @Input() rows: number = 20;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(event: PaginatorState): void {
    if (event.page !== undefined) {
      this.pageChange.emit(event.page + 1);
    }
  }
}
