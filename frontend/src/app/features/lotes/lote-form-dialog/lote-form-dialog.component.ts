import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Lote } from '../../../core/models/models';

@Component({
  selector: 'app-lote-form-dialog',
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
  templateUrl: './lote-form-dialog.component.html'
})
export class LoteFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<LoteFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Lote | null
  ) {
    this.form = this.fb.group({
      nombre: [this.data?.nombre ?? '', []],
      caravana_color: [this.data?.caravana_color ?? ''],
      fecha_inicio: [this.data?.fecha_inicio ?? null],
      peso_inicial_promedio: [this.data?.peso_inicial_promedio ?? null],
      estado: [this.data?.estado ?? 'activo'],
      observaciones: [this.data?.observaciones ?? '']
    });
  }

  guardar(): void {
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      fecha_inicio: raw.fecha_inicio
        ? new Date(raw.fecha_inicio as unknown as string).toISOString().slice(0, 10)
        : null
    };
    this.ref.close(payload);
  }

  cancelar(): void {
    this.ref.close();
  }
}
