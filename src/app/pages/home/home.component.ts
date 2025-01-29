import { Ciudades } from './../../shared/models/ciudades.model';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  ciudades: Ciudades[] = [
    { id: 68001, ciudad: 'Bucaramanga' },
    { id: 68001, ciudad: 'Bogota' },
    { id: 68001, ciudad: 'Cartagena' },
  ];
}
