import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AnimalService } from '../../../core/services/animal.service';
import { Animal } from '../../../core/models/models';

@Component({
  selector: 'app-venta-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './venta-form-dialog.component.html'
})
export class VentaFormDialogComponent implements OnInit {
  animalesActivos = signal<Animal[]>([]);
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private ref: MatDialogRef<VentaFormDialogComponent>
  ) {
    this.form = this.fb.group({
      animal_id: [null, Validators.required],
      fecha_venta: [new Date(), Validators.required],
      peso_venta_kg: [null, Validators.required],
      precio_kg: [null, Validators.required],
      comprador: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.animalService.listar({ estado: 'activo' }).subscribe((animales) => this.animalesActivos.set(animales));
  }

  get total(): number {
    const { peso_venta_kg, precio_kg } = this.form.getRawValue();
    return (peso_venta_kg ?? 0) * (precio_kg ?? 0);
  }

  guardar(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.ref.close({
      ...raw,
      fecha_venta: new Date(raw.fecha_venta as unknown as string).toISOString().slice(0, 10)
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
