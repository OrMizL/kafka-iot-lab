import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvgTableComponent } from './avg-table.component';

describe('AvgTableComponent', () => {
  let component: AvgTableComponent;
  let fixture: ComponentFixture<AvgTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvgTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvgTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
