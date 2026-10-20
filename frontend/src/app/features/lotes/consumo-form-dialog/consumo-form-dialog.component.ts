import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AlimentoService } from '../../../core/services/alimento.service';
import { Alimento } from '../../../core/models/models';

@Component({
  selector: 'app-consumo-form-dialog',
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
  templateUrl: './consumo-form-dialog.component.html'
})
export class ConsumoFormDialogComponent implements OnInit {
  alimentos = signal<Alimento[]>([]);
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private alimentoService: AlimentoService,
    private ref: MatDialogRef<ConsumoFormDialogComponent>
  ) {
    this.form = this.fb.group({
      alimento_id: [null, Validators.required],
      fecha: [new Date(), Validators.required],
      cantidad_kg: [null, Validators.required],
      costo_total: [null],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.alimentoService.listar(true).subscribe((alimentos) => {
      this.alimentos.set(alimentos);
    });
  }

  onAlimentoChange(alimentoId: number): void {
    const alimento = this.alimentos().find((a) => a.id === alimentoId);
    const cantidad = this.form.value.cantidad_kg;
    if (alimento?.costo_kg_referencia != null && cantidad) {
      this.form.patchValue({ costo_total: Math.round(alimento.costo_kg_referencia * cantidad * 100) / 100 });
    }
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
