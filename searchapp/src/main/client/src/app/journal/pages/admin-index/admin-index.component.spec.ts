import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIndexComponent } from './admin-index.component';

describe('AdminIndexComponent', () => {
  let component: AdminIndexComponent;
  let fixture: ComponentFixture<AdminIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminIndexComponent]
    });
    fixture = TestBed.createComponent(AdminIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
