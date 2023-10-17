import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MaterialCssVarsModule, MaterialCssVarsService } from 'angular-material-css-vars';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AppState } from './app.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet , MatButtonModule, MaterialCssVarsModule, EditorModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    public materialCssVarsService: MaterialCssVarsService,
    public state: AppState) { }

  ngOnInit() {
    const hex = "#ccCC00";
    this.materialCssVarsService.setDarkTheme(true);
    this.materialCssVarsService.setPrimaryColor(hex);
    this.materialCssVarsService.setAccentColor("#333");
  }
}
