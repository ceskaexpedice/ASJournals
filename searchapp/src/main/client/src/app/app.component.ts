import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    public materialCssVarsService: MaterialCssVarsService,
    public state: AppState) { }

  ngOnInit() {
    if (this.state.currentMagazine) {
      if (isPlatformBrowser(this.platformId)) {
        this.materialCssVarsService.setPrimaryColor('#' + this.state.currentMagazine.color);
      }
      this.titleService.setTitle(this.state.currentMagazine['title_' + this.state.currentLang]);
    }
    
  }
}
