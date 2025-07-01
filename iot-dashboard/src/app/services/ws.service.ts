import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, delay, retry, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface MinuteRow {
  deviceId: string;
  minute:   string; // ISO-ish
  avg_temp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private ws$!: WebSocketSubject<MinuteRow>;
  private stream$ = new Subject<MinuteRow>();

  constructor() {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      this.ws$ = webSocket<MinuteRow>('ws://localhost:3000/ws/data');
      this.ws$
        .pipe(retry({ delay: 3000 }))
        .subscribe(this.stream$);
    }
  }

  rows(): Observable<MinuteRow> {
    return this.stream$.asObservable().pipe(share());
  }
}
