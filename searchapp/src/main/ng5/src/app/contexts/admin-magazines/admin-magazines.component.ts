import {Component, OnInit} from '@angular/core';
import {Magazine} from 'app/models/magazine';
import {Router} from '@angular/router';
import {AppService} from 'app/services/app.service';
import {AppState} from 'app/app.state';
import {MagazinesService} from '../magazines.service';
import {MzToastService} from "ngx-materialize";

@Component({
  selector: 'app-admin-magazines',
  templateUrl: './admin-magazines.component.html',
  styleUrls: ['./admin-magazines.component.scss']
})
export class AdminMagazinesComponent implements OnInit {
  currentMag: Magazine;

  currentEditor: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  };

  editors: {
    id: string,
    typ: string,
    name: string,
    adresa: string,
    web: string
  }[];

  editing: string = 'journals';
  constructor(
    public state: AppState,
    private service: MagazinesService,
    private toastService: MzToastService,
    private router: Router) {}

  ngOnInit() {
    this.getEditors();
  }
  
  getEditors(){
    this.service.getEditors().subscribe(state => {
      this.editors = state['editorsList'];
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
    var c = confirm('Delete editor "' + this.currentEditor.id + '"?');
    if (c == true) {
      this.service.deleteEditor(this.currentEditor.id).subscribe(res => {
        this.service.getEditors().subscribe(state => {
          this.editors = state['editorsList'];
        });
      });
    }
  }

  saveEditor() {
    if (this.currentEditor.id === '') {
      //error
      alert('Id is required');
      return;
    }
    this.service.saveEditor(this.currentEditor).subscribe(res => {
      this.service.getEditors().subscribe(state => {
        this.editors = state['editorsList'];
        this.toastService.show('Saved success!', 3000, 'green');
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

  editCtx(mag) {
    this.currentMag = JSON.parse(JSON.stringify(mag));
  }

  editEditor(editor) {
    this.currentEditor = JSON.parse(JSON.stringify(editor));
  }

  save() {
    if (this.currentMag.ctx === '') {
      //error
      alert('Context is required');
      return;
    }
    this.service.saveMagazine(this.currentMag).subscribe(res => {
      this.service.getMagazines().subscribe(state => {
        this.state.ctxs = state['magazines'];
        this.toastService.show('Saved success!', 3000, 'green');
      });
    });
  }

  removeJournal() {
    var c = confirm('Delete journal "' + this.currentMag.ctx + '"?');
    if (c == true) {
      this.service.deleteMagazine(this.currentMag.ctx).subscribe(res => {
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
