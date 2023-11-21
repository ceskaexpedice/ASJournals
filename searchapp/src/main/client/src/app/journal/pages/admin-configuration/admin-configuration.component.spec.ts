import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConfigurationComponent } from './admin-configuration.component';

describe('AdminConfigurationComponent', () => {
  let component: AdminConfigurationComponent;
  let fixture: ComponentFixture<AdminConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminConfigurationComponent]
    });
    fixture = TestBed.createComponent(AdminConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
