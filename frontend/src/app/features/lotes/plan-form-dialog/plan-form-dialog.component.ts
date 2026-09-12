import { Component, Inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AlimentoService } from '../../../core/services/alimento.service';
import { Alimento } from '../../../core/models/models';

@Component({
  selector: 'app-plan-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './plan-form-dialog.component.html'
})
export class PlanFormDialogComponent implements OnInit {
  alimentos = signal<Alimento[]>([]);
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private alimentoService: AlimentoService,
    private ref: MatDialogRef<PlanFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { orden: number }
  ) {
    this.form = this.fb.group({
      alimento_id: [null, Validators.required],
      dia_desde: [1, Validators.required],
      dia_hasta: [15, Validators.required],
      pct_consumo_pv: [0.03, Validators.required],
      adpv_esperado_kg: [0.3, Validators.required],
      costo_kg: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.alimentoService.listar(true).subscribe((alimentos) => {
      this.alimentos.set(alimentos);
    });
  }

  onAlimentoChange(alimentoId: number): void {
    const alimento = this.alimentos().find((a) => a.id === alimentoId);
    if (alimento?.costo_kg_referencia != null) {
      this.form.patchValue({ costo_kg: alimento.costo_kg_referencia });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue());
  }

  cancelar(): void {
    this.ref.close();
  }
}
