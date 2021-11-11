import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MagazineEditComponent } from './magazine-edit.component';

describe('MagazineEditComponent', () => {
  let component: MagazineEditComponent;
  let fixture: ComponentFixture<MagazineEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagazineEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagazineEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
