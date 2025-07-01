import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsService, MinuteRow } from '../../services/ws.service';

@Component({
  selector: 'app-avg-table',
  imports: [CommonModule],
  templateUrl: './avg-table.component.html',
  styleUrl: './avg-table.component.css'
})
export class AvgTableComponent {
  private latest = new Map<string, MinuteRow>();

  rowsByDevice = computed(() => [...this.latest.values()]);

  constructor(ws: WsService) {
    ws.rows().subscribe(row => {
      this.latest.set(row.deviceId, row);
    });
  }

  tempClass(temp: number) {
    return temp > 25 ? 'hot' : temp > 22 ? 'warm' : 'ok'; 
  }
}
