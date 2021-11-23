import {Component, OnInit} from '@angular/core';

import {Router} from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { MagazinesService } from '../../magazines.service';

export type User = {
  username: string,
  ctxs: string[],
  name: string
}

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

  currentUser?:  User;

  users: User[] = [];

  editing: string = 'journals';
  constructor(
    public state: AppState,
    private service: MagazinesService,
    private router: Router) {}

  ngOnInit() {
    this.getEditors();
    this.getUses();
  }
  
  getEditors(){
    this.service.getEditors().subscribe(state => {
      this.editors = state['editorsList'];
      this.currentMag = JSON.parse(JSON.stringify(this.state.ctxs[0]));
      this.currentEditor = JSON.parse(JSON.stringify(this.editors[0]));
      
    });
  }
  
  getUses(){
    this.service.getUsers().subscribe(res => {
      this.users = res['response']['docs'];
      this.currentUser = JSON.parse(JSON.stringify(this.users[0]));
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

  

  addUser() {
    this.currentUser = {
      username: '',
      name: '',
      ctxs: []
    };
  }

  editUser(user: User) {
    this.currentUser = JSON.parse(JSON.stringify(user));
  }

  removeUser() {
    var c = confirm('Delete user "' + this.currentUser?.username + '"?');
    if (c == true) {
      this.service.deleteUser(this.currentUser!.username).subscribe(res => {
        this.service.getUsers().subscribe(res2 => {
          this.users = res2['editorsList'];
        });
      });
    }
  }

  saveUser() {
    if (this.currentUser?.username === '') {
      //error
      alert('Id is required');
      return;
    }
    this.service.saveUser(this.currentUser).subscribe(res => {
      this.service.getUsers().subscribe(res2 => {
        this.editors = res2['editorsList'];
        this.service.showSnackBar('Saved success!');
      });
    });
  }


  save() {
    if (this.currentMag?.ctx === '') {
      //error
      alert('Context is required');
      return;
    }
    this.service.saveMagazine(this.currentMag!).subscribe(res => {
      this.service.getMagazines().subscribe(res2 => {
        this.state.ctxs = res2['response']['docs'];
        this.service.showSnackBar('Saved success!');
      });
    });
  }

  removeJournal() {
    var c = confirm('Delete journal "' + this.currentMag?.ctx + '"?');
    if (c == true) {
      this.service.deleteMagazine(this.currentMag?.ctx!).subscribe(res => {
        this.service.getMagazines().subscribe(res2 => {
          // this.state.setJournals(res);
          
          this.state.ctxs = res2['response']['docs'];
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
