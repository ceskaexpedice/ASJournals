import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';
import { Magazine } from 'src/app/models/magazine';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FilesDialogComponent } from '../../components/files-dialog/files-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


declare var tinymce: any;

interface MenuItem {
  id: string,
  route: string,
  cs: string,
  en: string,
  visible: boolean,
  children: MenuItem[]
}


@Component({
  selector: 'app-admin-interface',
  standalone: true,
  imports: [CommonModule, AngularSplitModule, FormsModule, EditorModule,
    MatCheckboxModule, TranslateModule, MatDividerModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule],
  templateUrl: './admin-interface.component.html',
  styleUrls: ['./admin-interface.component.scss']
})
export class AdminInterfaceComponent {

  menu: any[] = [];
  pages: any[] = [];
  selected: MenuItem | undefined;
  selectedPage: string | undefined;
  visibleChanged: boolean = false;


  text: string | null = null;
  elementId: string = 'editEl';
  editor: any;

  description: string = '';

  newctx: string = '';

  currentMag: Magazine | null = null;
  tinyConfig: any;
  tinyInited = false;

  selectedFile: string | null = null;
  fileList: string[]

  tab: string = 'config';
  saved: boolean = false;

  subscriptions: Subscription[] = [];



  constructor(
    public dialog: MatDialog,
    private config: Configuration,
    public state: AppState,
    private service: AppService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // this.subscriptions.push(this.configSubject.subscribe(val => {
    //   this.fillMenu();


    // }));
    this.initTiny();


    this.service.langSubject.subscribe(() => {
      this.tinyInited = false;
      setTimeout(() => {
        this.initTiny();
      }, 100);
    });

    
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
    });

  }

  ngAfterViewInit() {
    if (this.config) {
      setTimeout(() => {
        this.fillMenu();
        this.initTiny();
      }, 100);
    }
  }


  initData() {

    this.subscriptions.push(this.service.langSubject.subscribe(val => {
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
      plugins: ['link', 'paste', 'table', 'save', 'code', 'image'],
      toolbar: 'save | undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code mybutton',
      // skin_url: this.config['context'] + 'assets/skins/lightgray',
      images_upload_url: 'api/lf?action=UPLOAD&isImage=true&ctx=' + this.state.currentMagazine?.ctx,
      automatic_uploads: true,
      relative_urls: false,
      setup: (editor: any) => {
        this.editor = editor;
        this.initData();
        editor.ui.registry.addButton('mybutton', {
          tooltip: this.service.translateKey('admin.insertLink'),
          icon: 'upload',
          //icon: false,
          onAction: function () {
            that.browseFiles();
          }
        });
      },

      save_oncancelcallback: function () { console.log('Save canceled'); },
      save_onsavecallback: () => this.save()
    };

    // tinymce.init(this.tinyConfig);

    this.tinyInited = true;
  }

  public browseFiles() {

    this.editor.focus();
      const dialogRef = this.dialog.open(FilesDialogComponent, {
        width: '600px',
        data: {
          ctx: this.state.currentMagazine.ctx,
          fileList: this.fileList
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selectedFile = result;
          const link = this.config['context'] + 'api/lf?action=GET_FILE&ctx=' + this.state.currentMagazine?.ctx;
          console.log(link);
          this.editor.insertContent('&nbsp;<a target="_blank" href="' + link + '&filename=' + this.selectedFile + '">' + this.selectedFile + '</a>&nbsp;');
        }
      });

  }

  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    tinymce.remove(this.editor);
  }

  fillMenu() {

    this.pages = JSON.parse(JSON.stringify(this.config.layout.pages));
    this.menu = JSON.parse(JSON.stringify(this.config.layout.menu));

  }

  getText() {

    let page: string = '';
    if (this.selectedPage) {
      page = this.selectedPage;
    }
    // if (this.selected) {
    //   page = this.selected?.id;
    // } else if (this.selectedPage) {
    //   page = this.selectedPage;
    // }
    if (page === '') {
      return;
    }
    this.service.getText(page).subscribe(t => {
      this.text = t;
      // this.editor.setContent(this.text);
    });
  }

  selectPage(page: string) {
    this.selected = undefined;
    this.selectedPage = page;
    this.getText();
  }

  select(m: MenuItem, m1: MenuItem | null) {
    this.selectedPage = m.id;
    this.selected = m;
    if (m1) {
      this.selectedPage = m.id + '/' + m1.id;
      this.selected = m1;
    }
    this.saved = false;
    this.getText();
  }

  saveMenu() {
    const m = JSON.stringify({ menu: this.menu, pages: this.pages });

    this.service.saveMenu(m).subscribe((res: any) => {
      this.saved = !res.hasOwnProperty('error');
    });
  }

  save() {
    if (!this.selectedPage) {
      return;
    }

    const content = this.editor.getContent();

    const m = JSON.stringify({ menu: this.menu, pages: this.pages });

    this.service.saveText(this.selectedPage, content, m).subscribe(res => {

      this.saved = !res.hasOwnProperty('error');
      //if (res.hasOwnProperty('error')) {
      //  this.saved = !res.hasOwnProperty('error');
      //} else {
      //this.service.saveJournalConfig().subscribe(res2 => {
      //this.saved = !res2.hasOwnProperty('error');
      //if (!res2.hasOwnProperty('error')) {
      //  this.service.getJournalConfig(this.state.currentMagazine).subscribe();
      //  this.service.switchStyle();
      //}
      //});
      //}
    });
  }

  changeVisible() {
    this.visibleChanged = true;
  }

  addChild(m: MenuItem) {
    m.children.push({
      id: m.route + '_' + m.children.length,
      route: m.route + '_' + m.children.length + '_new',
      cs: m.cs,
      en: m.en,
      visible: true,
      children: []
    })
  }

  findNewMenuId() {
    let idx = this.menu.length;
    let id = 'menu_' + idx;
    while (this.menu.filter(m => m.id === id).length > 0) {
      id = 'menu_' + idx++;
    }
    return id;
  }

  addMenu() {
    let id = this.findNewMenuId();
    this.menu.push({
      id: id,
      route: id + '_new',
      cs: 'Nazev CS',
      en: 'Name EN',
      visible: true,
      added: true,
      children: []
    })
  }

  removeMenu(idx: number) {
    this.menu.splice(idx, 1);
  }

  remove(arr: any[], idx: number) {
    arr.splice(idx, 1);
  }

  moveUp(arr: any[], idx: number) {
    this.moveArr(arr, idx, idx - 1);
  }

  moveDown(arr: any[], idx: number) {
    this.moveArr(arr, idx, idx + 1);
  }

  moveArr(arr: any[], old_index: number, new_index: number) {
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);

  }

  isRouteActive(currentRoute: string): boolean {
    return this.router.isActive(this.router.createUrlTree([currentRoute], { relativeTo: this.route }).toString(), true);
  }

}
