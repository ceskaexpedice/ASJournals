import {Component, OnInit} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {Router, RouterModule} from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { User } from 'src/app/models/user';
import { DialogPromptComponent } from '../../components/dialog-prompt/dialog-prompt.component';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { LicencesDialogComponent } from './licences-dialog/licences-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {MatTabsModule} from '@angular/material/tabs';
import { MagazineEditComponent } from './magazine-edit/magazine-edit.component';
import { EditorEditComponent } from './editor-edit/editor-edit.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { MatButtonModule } from '@angular/material/button';
import { AngularSplitModule } from 'angular-split';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';

declare var tinymce: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, AngularSplitModule, EditorModule,
    MagazineEditComponent, EditorEditComponent, UserEditComponent,
    MatButtonModule, MatFormFieldModule, MatListModule, MatSelectModule, MatIconModule, MatTabsModule, MatDialogModule],
  selector: 'app-admin-magazines',
  templateUrl: './admin-magazines.component.html',
  styleUrls: ['./admin-magazines.component.scss']
})
export class AdminMagazinesComponent implements OnInit {

  currentMag: Magazine | null = null;
  tinyConfig: any;
  tinyInited = false;
  text: string | null = null;
  elementId: string = 'editEl';
  editor: any;

  selectedPage: string;

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

  
  subscriptions: Subscription[] = [];
  
  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    public state: AppState,
    public magState: MagazineState,
    private service: MagazinesService,
    private router: Router) {}

    

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    tinymce.remove(this.editor);
  }

  ngOnInit() {
    this.getEditors();
    this.getUses();
    
    this.initTiny();

    this.service.langSubject.subscribe(() => {
      this.tinyInited = false;
      setTimeout(() => {
        this.initTiny();
      }, 100);
    });
  }
  
  getEditors(){
    this.service.getEditors().subscribe(state => {
      this.editors = state['editorsList'];
      this.currentMag = JSON.parse(JSON.stringify(this.state.ctxs[0]));
      if (this.editors.length > 0) {
        this.currentEditor = JSON.parse(JSON.stringify(this.editors[0]));
      }
      
      
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
      isAdmin: false,
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
          this.users = res2['response']['docs'];
        });
      });
    }
  }

  resetPwd() {
    
    const dialogRef = this.dialog.open(DialogPromptComponent, {
      width: '700px',
      data: {caption: 'nove_heslo', label: 'nove_heslo'},
      panelClass: 'app-register-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.resetPwd(this.currentUser!.username, result).subscribe(res => {
          if (res.error) {
            this.service.showSnackBar(res.error, '', true);
            if (res.logged.toString() === 'false') {
              this.service.logout();
            }
          } else {
            this.service.getUsers().subscribe(res2 => {
              this.users = res2['response']['docs'];
            });
          }
        });
      }
    });
  }

  saveUser() {
    if (this.currentUser?.username === '') {
      //error
      alert('Id is required');
      return;
    }
    this.service.saveUser(this.currentUser).subscribe(res => {
      this.service.getUsers().subscribe(res2 => {
        this.users = res2['response']['docs'];
        this.service.showSnackBar('Saved success!');
      });
    });
  }


  save() {
    if (!this.currentMag || this.currentMag.ctx === '') {
      //error
      alert('Context is required');
      return;
    }
    this.currentMag.kramerius_version = this.currentMag.isK7 ? 'k7' : 'k5';

    this.service.saveMagazine(this.currentMag!).subscribe(res => {
      this.service.getMagazines().subscribe(res2 => {
        this.state.ctxs = res2['response']['docs'];
        this.state.ctxs.forEach((m: Magazine) => m.isK7 = m.kramerius_version === 'k7');
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

  setLicences() {
    const dialogRef = this.dialog.open(LicencesDialogComponent, {
      width: '1150px',
      data: this.currentMag,
      panelClass: 'app-dialog-states'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentMag!.licences = JSON.stringify(result);
      }

    });
  }

  getText() {
    let page: string = '';
    if (this.selectedPage) {
      page = this.selectedPage;
    }
    if (page === '') {
      return;
    }
    this.service.getText(page).subscribe(t => {
      this.text = t;
    });
  }

  initData() {

    this.subscriptions.push(this.translate.onLangChange.subscribe(val => {
      this.getText();
    }));


  }

  initTiny() {

    var that = this;
    this.tinyConfig = {

      base_url: '/tinymce',
      suffix: '.min',

      language: this.state.currentLang,

      // selector: '#' + this.elementId,
      menubar: false,
      plugins: ['link', 'table', 'save', 'code', 'image'],
      toolbar: 'save | undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code mybutton',
      // skin_url: this.config['context'] + 'assets/skins/lightgray',
      images_upload_url: 'api/lf?action=UPLOAD&isImage=true&ctx=magazines',
      automatic_uploads: true,
      relative_urls: false,
      setup: (editor: any) => {
        this.editor = editor;
        this.initData();
        // editor.ui.registry.addButton('mybutton', {
        //   tooltip: this.service.translateKey('admin.insertLink'),
        //   icon: 'upload',
        //   //icon: false,
        //   onAction: function () {
        //     that.browseFiles();
        //   }
        // });
      },

      save_oncancelcallback: function () { console.log('Save canceled'); },
      save_onsavecallback: () => this.savePage()
    };

    // tinymce.init(this.tinyConfig);

    this.tinyInited = true;
  }

  savePage() {
    if (!this.selectedPage) {
      return;
    }

    const content = this.editor.getContent();

    this.service.saveText(this.selectedPage, content).subscribe(res => {
      // this.saved = !res.hasOwnProperty('error');
    });
  }

  selectPage(p: string) {
    this.selectedPage = p;
    this.getText();
  }

}
