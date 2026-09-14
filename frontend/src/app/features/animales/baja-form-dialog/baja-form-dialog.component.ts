import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-baja-form-dialog',
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
  templateUrl: './baja-form-dialog.component.html'
})
export class BajaFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<BajaFormDialogComponent>
  ) {
    this.form = this.fb.group({
      fecha_baja: [new Date(), Validators.required],
      motivo_baja: ['muerte', Validators.required],
      observaciones: ['']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.ref.close({
      ...raw,
      fecha_baja: new Date(raw.fecha_baja as unknown as string).toISOString().slice(0, 10)
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
