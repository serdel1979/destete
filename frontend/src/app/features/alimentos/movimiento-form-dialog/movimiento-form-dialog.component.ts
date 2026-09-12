import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Alimento } from '../../../core/models/models';

@Component({
  selector: 'app-movimiento-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './movimiento-form-dialog.component.html'
})
export class MovimientoFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<MovimientoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Alimento
  ) {
    this.form = this.fb.group({
      tipo: ['entrada', Validators.required],
      fecha: [new Date(), Validators.required],
      cantidad_kg: [null, Validators.required],
      costo_total: [null],
      proveedor: [''],
      observaciones: ['']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.ref.close({
      ...raw,
      fecha: new Date(raw.fecha as unknown as string).toISOString().slice(0, 10)
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
