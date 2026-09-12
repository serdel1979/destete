import { Component, Inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LoteService } from '../../../core/services/lote.service';
import { Animal, Lote } from '../../../core/models/models';

@Component({
  selector: 'app-animal-form-dialog',
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
  templateUrl: './animal-form-dialog.component.html'
})
export class AnimalFormDialogComponent implements OnInit {
  lotes = signal<Lote[]>([]);
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private loteService: LoteService,
    private ref: MatDialogRef<AnimalFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Animal | null
  ) {
    this.form = this.fb.group({
      caravana: [this.data?.caravana ?? '', Validators.required],
      sexo: [this.data?.sexo ?? 'H', Validators.required],
      caracteristicas: [this.data?.caracteristicas ?? ''],
      fecha_nacimiento: [this.data?.fecha_nacimiento ?? null],
      fecha_destete: [this.data?.fecha_destete ?? null],
      madre: [this.data?.madre ?? ''],
      padre: [this.data?.padre ?? ''],
      lote_id: [this.data?.lote_id ?? null],
      observaciones: [this.data?.observaciones ?? '']
    });
  }

  ngOnInit(): void {
    this.loteService.listar().subscribe((lotes) => this.lotes.set(lotes));
  }

  private fmt(d: unknown): string | null {
    return d ? new Date(d as string).toISOString().slice(0, 10) : null;
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.ref.close({
      ...raw,
      fecha_nacimiento: this.fmt(raw.fecha_nacimiento),
      fecha_destete: this.fmt(raw.fecha_destete)
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
