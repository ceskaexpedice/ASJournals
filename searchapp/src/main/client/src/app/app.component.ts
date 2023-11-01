import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MaterialCssVarsModule, MaterialCssVarsService } from 'angular-material-css-vars';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AppState } from './app.state';
import { Title, Meta } from '@angular/platform-browser';
import { AppWindowRef } from './app.window-ref';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet , MatButtonModule, MaterialCssVarsModule, EditorModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: AppWindowRef,
    private titleService: Title,
    private meta: Meta,
    public materialCssVarsService: MaterialCssVarsService,
    public state: AppState) { }

  ngOnInit() {
    if (this.state.currentMagazine) {
      this.materialCssVarsService.setPrimaryColor('#' + this.state.currentMagazine.color);
      this.titleService.setTitle(this.state.currentMagazine.title);
      this.meta.removeTag('name=description');
      this.meta.removeTag('name=author');
      this.meta.removeTag('name=keywords');
      this.meta.addTags([
        { name: 'description', content: this.state.currentMagazine.desc },
        { name: 'author', content: this.state.currentMagazine.vydavatel },
        { name: 'keywords', content: this.state.currentMagazine.keywords.join(',') },
        { property: 'og:title', content: this.state.currentMagazine.title }, // <meta property="og:title" content="Your appealing title here" />
        { property: 'og:description', content: this.state.currentMagazine.desc },
      ]);
    }
    
  }
}
