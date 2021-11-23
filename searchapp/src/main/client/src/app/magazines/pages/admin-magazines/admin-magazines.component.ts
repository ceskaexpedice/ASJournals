import {Component, OnInit} from '@angular/core';

import {Router} from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { MagazinesService } from '../../magazines.service';

@Component({
  selector: 'app-admin-magazines',
  templateUrl: './admin-magazines.component.html',
  styleUrls: ['./admin-magazines.component.scss']
})
export class AdminMagazinesComponent implements OnInit {
  currentMag: Magazine | null = null;

  currentEditor: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  } | null = null;

  editors: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  }[]  = [];

  editing: string = 'journals';
  constructor(
    public state: AppState,
    private service: MagazinesService,
    private router: Router) {}

  ngOnInit() {
    this.getEditors();
  }
  
  getEditors(){
    this.service.getEditors().subscribe(state => {
      this.editors = state['editorsList'];
      this.currentMag = JSON.parse(JSON.stringify(this.state.ctxs[0]));
    });
  }

  addEditor() {

    this.currentEditor = {
      id: '',
      typ: '',
      name: '',
      adresa: '',
      web: ''
    };
  }

  removeEditor() {
    var c = confirm('Delete editor "' + this.currentEditor?.id + '"?');
    if (c == true) {
      this.service.deleteEditor(this.currentEditor!.id).subscribe(res => {
        this.service.getEditors().subscribe(state => {
          this.editors = state['editorsList'];
        });
      });
    }
  }

  saveEditor() {
    if (this.currentEditor?.id === '') {
      //error
      alert('Id is required');
      return;
    }
    this.service.saveEditor(this.currentEditor).subscribe(res => {
      this.service.getEditors().subscribe(state => {
        this.editors = state['editorsList'];
        this.service.showSnackBar('Saved success!');
      });
    });
  }

  addJournal() {

    let newctx = new Magazine();
    newctx.ctx = 'novy_nazev_v_url';
    newctx.color = "CCCCCC";
    newctx.journal = 'uuid:';
    newctx.showTitleLabel = true;
    newctx.licence = 'CC-BY-SA';

    this.currentMag = newctx;
  }

  editCtx(mag: Magazine) {
    this.currentMag = JSON.parse(JSON.stringify(mag));
  }

  editEditor(editor: any) {
    this.currentEditor = JSON.parse(JSON.stringify(editor));
  }

  save() {
    if (this.currentMag?.ctx === '') {
      //error
      alert('Context is required');
      return;
    }
    this.service.saveMagazine(this.currentMag!).subscribe(res => {
      this.service.getMagazines().subscribe(state => {
        this.state.ctxs = state['magazines'];
        this.service.showSnackBar('Saved success!');
      });
    });
  }

  removeJournal() {
    var c = confirm('Delete journal "' + this.currentMag?.ctx + '"?');
    if (c == true) {
      this.service.deleteMagazine(this.currentMag?.ctx!).subscribe(res => {
        this.service.getMagazines().subscribe(state => {
          this.state.ctxs = state['magazines'];
        });
      });
    }
  }

  cancel() {
    this.currentMag = null;
    this.currentEditor = null;
  }

  edit(s: string) {
    this.editing = s;
  }

}
