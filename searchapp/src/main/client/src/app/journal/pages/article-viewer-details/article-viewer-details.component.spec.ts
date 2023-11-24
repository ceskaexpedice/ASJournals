import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleViewerDetailsComponent } from './article-viewer-details.component';

describe('ArticleViewerDetailsComponent', () => {
  let component: ArticleViewerDetailsComponent;
  let fixture: ComponentFixture<ArticleViewerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleViewerDetailsComponent]
    });
    fixture = TestBed.createComponent(ArticleViewerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
