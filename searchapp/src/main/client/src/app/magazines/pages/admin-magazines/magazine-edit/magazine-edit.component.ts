import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';
import { MagazinesService } from 'src/app/magazines/magazines.service';
import { Magazine } from 'src/app/models/magazine';
import {MatSelectModule} from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, MatButtonModule,
    MatFormFieldModule, MatListModule, MatSelectModule, MatIconModule, MatTooltipModule, MatInputModule, MatCheckboxModule, MatOptionModule],
  selector: 'app-magazine-edit',
  templateUrl: './magazine-edit.component.html',
  styleUrls: ['./magazine-edit.component.scss']
})
export class MagazineEditComponent implements OnInit {

  @Input() mag: Magazine = new Magazine();
  @Input() editors: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  }[]  = [];

  vydavatel?: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  };
  // newKeyword: string = '';
  newLanguage: string = '';
  newOblast: {[lang: string]: string} = {};
  newKeyword: {[lang: string]: string} = {};

  showTitleLabel = true;
  
  constructor(
    public state: AppState,
    private service: MagazinesService) { }

  ngOnInit() {
    this.vydavatel = this.editors.find(e => e.id === this.mag.vydavatel_id)
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['mag']) {
      this.vydavatel = this.editors.find(e => e.id === this.mag.vydavatel_id);
      this.newOblast = {};
      if (!this.mag.languages) {
        this.mag.languages = ['cs'];
      }
      this.mag.languages.forEach(lang => {
        this.newOblast[lang] = '';
      });
      
    }
  }
  
  removeKeyword(idx: number, lang: string){
    this.mag['keyword_'+lang].splice(idx, 1);
  }
  
  addKeyword(lang: string){

    if(this.newKeyword[lang] !== ''){
      if(!this.mag['keyword_'+lang]){
        this.mag['keyword_'+lang] = [];
      }
      this.mag['keyword_'+lang].push(this.newKeyword[lang]);
      this.newKeyword[lang] = '';
    }

  }
  
  removeLanguage(idx: number){
    this.mag.languages.splice(idx, 1);
  }
  
  addLanguage(){
    if(this.newLanguage !== ''){
      if(!this.mag.languages){
        this.mag.languages = [];
      }
        this.mag.languages.push(this.newLanguage);
      this.newLanguage = '';
    }
  }
  
  removeOblast(idx: number, lang: string){
    this.mag['oblast_'+lang].splice(idx, 1);
  }
  
  addOblast(lang: string){
    if(this.newOblast[lang] !== ''){
      if(!this.mag['oblast_'+lang]){
        this.mag['oblast_'+lang] = [];
      }
      this.mag['oblast_'+lang].push(this.newOblast[lang]);
      this.newOblast[lang] = '';
    }
  }

  setVydavatel(e: any) {
    this.mag.vydavatel_id = e.id;
    this.mag.vydavatel = e.name;
  }

}