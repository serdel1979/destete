import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-pesaje-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './pesaje-form-dialog.component.html'
})
export class PesajeFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<PesajeFormDialogComponent>
  ) {
    this.form = this.fb.group({
      fecha: [new Date(), Validators.required],
      peso_kg: [null, Validators.required],
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
