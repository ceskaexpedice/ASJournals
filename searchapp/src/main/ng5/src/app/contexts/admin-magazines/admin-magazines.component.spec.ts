import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMagazinesComponent } from './admin-magazines.component';

describe('AdminMagazinesComponent', () => {
  let component: AdminMagazinesComponent;
  let fixture: ComponentFixture<AdminMagazinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminMagazinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMagazinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
