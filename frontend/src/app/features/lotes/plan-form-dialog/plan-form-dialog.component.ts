import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-plan-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './plan-form-dialog.component.html'
})
export class PlanFormDialogComponent {
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<PlanFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orden: number }
  ) {
    this.form = this.fb.group({
      fase: ['', Validators.required],
      dia_desde: [1, Validators.required],
      dia_hasta: [15, Validators.required],
      pct_consumo_pv: [0.03, Validators.required],
      adpv_esperado_kg: [0.3, Validators.required],
      costo_kg: [0, Validators.required]
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
