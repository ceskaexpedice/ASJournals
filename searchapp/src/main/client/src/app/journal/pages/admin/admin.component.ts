import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ɵɵclassMapInterpolate1 } from '@angular/core';
import { Subscription } from 'rxjs';


// import { FileUploader } from 'ng2-file-upload';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { AppService } from 'src/app/services/app.service';
import { CommonModule } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';



declare var tinymce: any;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, TranslateModule],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  // @ViewChild('filesModal') filesModal: any;
  // @ViewChild('childModal') public childModal: ModalDirective | null = null;
  // @ViewChild('comfirmTemplate') public comfirmTemplate: ModalDirective | null = null;
  // @ViewChild('licencesModal') public licencesModal: ModalDirective | null = null;
  // @ViewChild('resetpwdModal') public resetpwdModal: ModalDirective | null = null;


  subscriptions: Subscription[] = [];

  // public uploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD' });
  // public coverUploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD&cover=true' });


  menu: any[] = [];
  pages: any[] = [];
  selected: MenuItem | undefined;
  selectedPage: string | undefined;
  visibleChanged: boolean = false;
  saved: boolean = false;
  sortBy = 'genre';

  text: string | null = null;
  elementId: string = 'editEl';
  editor: any;

  fileList: string[] = [];
  selectedFile: string | null = null;

  working: boolean = false;
  indexUUID: string | null = null;
  indexed: boolean = false;
  deleted: boolean = false;
  coverMsg: string | null = null;

  description: string = '';

  newctx: string = '';

  currentMag: Magazine | null = null;
  tinyConfig: any;
  tinyInited = false;

  resultMsg: string = '';

  tab: string = 'config';
  cache: any = {};
  licences: any = {};
  isK7: boolean = false;
  keepLang: boolean = false;

  newPwd = '';
  newPwdOk = false;

  constructor(
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
    if (this.state.currentMagazine.licences && this.state.currentMagazine.journal) {
      this.licences = JSON.parse(this.state.currentMagazine.licences);
    }

    if (this.state.currentMagazine.isK7) {
      this.isK7 = true
    }

    this.keepLang = !!this.state.currentMagazine!.keepLang;

    if (this.state.currentMagazine.sortByOrder) {
      this.sortBy = 'order';
    }

    this.cache[this.state.currentMagazine!.journal!] = { label: 'root', licence: '' };

    this.getChildren(this.state.currentMagazine!.journal!, this.state.currentMagazine);

    this.service.langSubject.subscribe(() => {
      this.tinyInited = false;
      setTimeout(() => {
        this.initTiny();
      }, 100);
    })

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
      images_upload_url: 'lf?action=UPLOAD&isImage=true&ctx=' + this.state.currentMagazine?.ctx,
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
            // that.browseFiles();
          }
        });
      },

      save_oncancelcallback: function () { console.log('Save canceled'); },
      save_onsavecallback: () => this.save()
    };

    // tinymce.init(this.tinyConfig);

    this.tinyInited = true;
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

    console.log(this.selectedPage)
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
    this.indexed = false;
    this.deleted = false;
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
    //console.log(this.menu);
  }

  index() {
    this.working = true;
    this.resultMsg = '';
    this.service.index(this.indexUUID!, this.isK7).subscribe(res => {
      this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
      this.working = false;
    });
  }

  // openConfirm() {
  //   this.comfirmTemplate?.show();
  // }

  // confirmDelete(): void {

  //   this.working = true;
  //   this.resultMsg = '';
  //   this.service.delete(this.indexUUID!).subscribe(res => {
  //     this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
  //     this.working = false;
  //   });
  //   this.comfirmTemplate?.hide();
  // }

  // decline(): void {
  //   this.comfirmTemplate?.hide();
  // }

  // uploadFile() {

  //   this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.state.currentMagazine?.ctx });
  //   this.uploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.uploaded();
  //   this.uploader.uploadAll();
  // }

  uploaded() {
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
    });
  }


  // uploadCover() {
  //   this.coverUploader.setOptions({ url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.currentMagazine?.ctx });
  //   this.coverUploader.onSuccessItem = (item: any, response: any, status: any, headers: any) => this.coverUploaded();
  //   this.coverUploader.uploadAll();
  // }

  coverUploaded() {
    this.coverMsg = 'ok';
  }

  // public selectFile(f: string) {
  //   this.selectedFile = f;

  //   this.childModal?.hide();
  //   const link = this.config['context'] + 'lf?action=GET_FILE&ctx=' + this.state.currentMagazine?.ctx;
  //   console.log(link);
  //   this.editor.insertContent('&nbsp;<a target="_blank" href="' + link + '&filename=' + this.selectedFile + '">' + this.selectedFile + '</a>&nbsp;');
  // }

  // public browseFiles() {
  //   this.service.getUploadedFiles().subscribe(res => {
  //     this.fileList = res['files'];
  //   });

  //   this.childModal?.show();
  // }

  // public closeFiles() {
  //   this.childModal?.hide();
  //   //this.editor.insertContent('&nbsp;<b>' + this.selectedFile + '</b>&nbsp;');
  // }

  // setLicences() {
  //   this.licencesModal?.show();
  // }

  setLabel(item: any) {
    let label = '';
    const mods = JSON.parse(item['mods']);
    if (item['model'] === 'periodicalvolume') {
      label += item.year;
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          label += ', ročník: ' + mods['mods:titleInfo']['mods:partNumber'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['date']) {
          //this.year = mods['part']['date'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
          //this.year = mods['mods:part']['mods:date'];
        }

        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          label += ' ' + mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          label += ' ' + mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    } else if (item['model'] === 'periodicalitem') {
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']['mods:partNumber']) {
          label += ' Číslo: ' + mods['mods:titleInfo']['mods:partNumber'];
        }
        if (mods['mods:titleInfo']['mods:partName']) {
          label += ' Part: ' + mods['mods:titleInfo']['mods:partName'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          label += ' Číslo: ' + mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          label += ' Číslo: ' + mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    }
    return label;
  }


  getChildren(pid: string, item: any) {

    if (!this.cache[pid]) {
      this.cache[pid] = { label: this.setLabel(item), licence: this.licences[pid] };
    }

    if (!this.cache[pid].children) {
      this.service.getChildren(pid).subscribe(res => {
        this.cache[pid].children = [];
        res.forEach((e: any) => {
          e.label = this.setLabel(e);
          this.cache[pid].children.push(e);
          this.cache[e.pid] = { label: this.setLabel(e), licence: this.licences[e.pid], show: false };
        });
      });
    }
    this.cache[pid].show = !this.cache[pid].show;
  }

  saveLicences() {
    const pids = Object.keys(this.cache);
    // const licences: any = {};
    pids.forEach(pid => {
      if (this.cache[pid]?.licence !== '') {
        this.licences[pid] = this.cache[pid].licence;
      } else if (this.cache[pid]?.licence === '') {
        delete (this.licences[pid]);
      }
    });
    this.state.currentMagazine!.licences = JSON.stringify(this.licences);

    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
      // this.service.getMagazines().subscribe(res2 => {
      //   this.state.ctxs = res2['response']['docs'];
      // });
    });

    // this.licencesModal?.hide();
  }

  saveMagazine() {
    this.state.currentMagazine!.sortByOrder = this.sortBy === 'order';
    this.state.currentMagazine!.keepLang = this.keepLang;
    this.service.saveMagazine(this.state.currentMagazine!).subscribe(res => {
    });
  }

  // showResetPwd() {
  //   this.resetpwdModal?.show();
  // }

  // resetPwd() {
  //   this.newPwdOk = false;
  //   if (this.newPwd !== '') {
  //     this.service.resetPwd(this.state.username, this.newPwd).subscribe(res => {
  //       if (res.error) {
  //         alert(res.error)
  //       } else {
  //         this.newPwdOk = true;
  //         this.resetpwdModal?.hide();
  //       }
  //     });
  //   }
  // }

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
    return this.router.isActive(this.router.createUrlTree([currentRoute], {relativeTo: this.route}).toString(), true);
  }

}

interface MenuItem {
  id: string,
  route: string,
  cs: string,
  en: string,
  visible: boolean,
  children: MenuItem[]
}
