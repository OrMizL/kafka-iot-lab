import { Component } from '@angular/core';
import { AvgTableComponent } from './components/avg-table/avg-table.component';

@Component({
  selector: 'app-root',
  imports: [AvgTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'iot-dashboard';
}
