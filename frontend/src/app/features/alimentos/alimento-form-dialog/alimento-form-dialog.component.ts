import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { Alimento } from '../../../core/models/models';

@Component({
  selector: 'app-alimento-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  templateUrl: './alimento-form-dialog.component.html'
})
export class AlimentoFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<AlimentoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Alimento | null
  ) {
    this.form = this.fb.group({
      nombre: [this.data?.nombre ?? '', Validators.required],
      descripcion: [this.data?.descripcion ?? ''],
      costo_kg_referencia: [this.data?.costo_kg_referencia ?? null],
      kg_por_bolsa: [this.data?.kg_por_bolsa ?? null],
      activo: [this.data?.activo ?? true]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue());
  }

  cancelar(): void {
    this.ref.close();
  }
}
