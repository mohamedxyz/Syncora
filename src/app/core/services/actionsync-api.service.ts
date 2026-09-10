import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Action, Conflict, Decision, Meeting } from '../models/actionsync.model';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ActionSyncApiService {
  private http = inject(HttpClient);
  private store = inject(StoreService);

  getMeetings(): Observable<Meeting[]> {
    return of(this.store.meetings()).pipe(delay(150));
  }

  getMeetingById(id: string): Observable<Meeting | undefined> {
    const meeting = this.store.meetings().find(m => m.id === id);
    return of(meeting).pipe(delay(120));
  }

  getActions(): Observable<Action[]> {
    return of(this.store.actions()).pipe(delay(150));
  }

  getDecisions(): Observable<Decision[]> {
    return of(this.store.decisions()).pipe(delay(150));
  }

  getConflicts(): Observable<Conflict[]> {
    return of(this.store.conflicts()).pipe(delay(150));
  }
}
