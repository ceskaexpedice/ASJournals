import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicencesDialogComponent } from './licences-dialog.component';

describe('LicencesDialogComponent', () => {
  let component: LicencesDialogComponent;
  let fixture: ComponentFixture<LicencesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicencesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicencesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
