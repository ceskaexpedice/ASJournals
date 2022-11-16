import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ɵɵclassMapInterpolate1 } from '@angular/core';
import { Subscription } from 'rxjs';


import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { FileUploader } from 'ng2-file-upload';
import { Router } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { AppService } from 'src/app/services/app.service';



declare var tinymce: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  @ViewChild('filesModal') filesModal: any;
  @ViewChild('childModal') public childModal: ModalDirective | null = null;
  @ViewChild('comfirmTemplate') public comfirmTemplate: ModalDirective | null = null;
  @ViewChild('licencesModal') public licencesModal: ModalDirective | null = null;
  @ViewChild('resetpwdModal') public resetpwdModal: ModalDirective | null = null;


  subscriptions: Subscription[] = [];

  public uploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD' });
  public coverUploader: FileUploader = new FileUploader({ url: 'lf?action=UPLOAD&cover=true' });


  menu: any[] = [];
  pages: any[] = [];
  selected: MenuItem | undefined;
  selectedPage: string | undefined;
  visibleChanged: boolean = false;
  saved: boolean = false;

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

  newPwd = '';
  newPwdOk = false;

  constructor(
    public state: AppState,
    private service: AppService,
    private modalService: BsModalService,
    private router: Router) { }

  ngOnInit() {
    this.subscriptions.push(this.state.configSubject.subscribe(val => {
      this.fillMenu();
      this.initTiny();

    }));

    if (this.state?.ctx?.licences && this.state?.ctx?.journal) {
      this.licences = JSON.parse(this.state.ctx.licences);
    }

    if (this.state?.ctx?.isK7) {
      this.isK7 = true
    }
    this.cache[this.state.ctx!.journal!] = { label: 'root', licence: '' };

    this.getChildren(this.state.ctx!.journal!, this.state.ctx);

  }

  ngAfterViewInit() {
    if (this.state.config) {
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

      // selector: '#' + this.elementId,
      menubar: false,
      plugins: ['link', 'paste', 'table', 'save', 'code', 'image'],
      toolbar: 'save | undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code mybutton',
      // skin_url: this.state.config['context'] + 'assets/skins/lightgray',
      images_upload_url: 'lf?action=UPLOAD&isImage=true&ctx=' + this.state.ctx?.ctx,
      automatic_uploads: true,
      relative_urls: false,
      setup: (editor: any) => {
        this.editor = editor;
        this.initData();
        editor.ui.registry.addButton('mybutton', {
          tooltip: 'Insert link to file',
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


  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
    tinymce.remove(this.editor);
  }

  fillMenu() {

    this.pages = JSON.parse(JSON.stringify(this.state.config.layout.pages));
    this.menu = JSON.parse(JSON.stringify(this.state.config.layout.menu));

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

    const content = this.editor.getContent();

    const m = JSON.stringify({ menu: this.menu, pages: this.pages });

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
    this.service.saveText(page, content, m).subscribe(res => {

      this.saved = !res.hasOwnProperty('error');
      //if (res.hasOwnProperty('error')) {
      //  this.saved = !res.hasOwnProperty('error');
      //} else {
      //this.service.saveJournalConfig().subscribe(res2 => {
      //this.saved = !res2.hasOwnProperty('error');
      //if (!res2.hasOwnProperty('error')) {
      //  this.service.getJournalConfig(this.state.ctx).subscribe();
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

  openConfirm() {
    this.comfirmTemplate?.show();
  }

  confirmDelete(): void {

    this.working = true;
    this.resultMsg = '';
    this.service.delete(this.indexUUID!).subscribe(res => {
      this.resultMsg = res.hasOwnProperty('error') ? res.error : res.msg;
      this.working = false;
    });
    this.comfirmTemplate?.hide();
  }

  decline(): void {
    this.comfirmTemplate?.hide();
  }

  uploadFile() {

    this.uploader.setOptions({ url: 'lf?action=UPLOAD&ctx=' + this.state.ctx?.ctx });
    this.uploader.onSuccessItem = (item, response, status, headers) => this.uploaded();
    this.uploader.uploadAll();
  }

  uploaded() {
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
    });
  }


  uploadCover() {
    // this.coverUploader = new FileUploader({url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.ctx.ctx});
    this.coverUploader.setOptions({ url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.ctx?.ctx });
    this.coverUploader.onSuccessItem = (item, response, status, headers) => this.coverUploaded();
    this.coverUploader.uploadAll();
  }

  coverUploaded() {
    this.coverMsg = 'ok';
  }

  public selectFile(f: string) {
    this.selectedFile = f;

    this.childModal?.hide();
    const link = this.state.config['context'] + 'lf?action=GET_FILE&ctx=' + this.state.ctx?.ctx;
    console.log(link);
    this.editor.insertContent('&nbsp;<a target="_blank" href="' + link + '&filename=' + this.selectedFile + '">' + this.selectedFile + '</a>&nbsp;');
  }

  public browseFiles() {
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
    });

    this.childModal?.show();
  }

  public closeFiles() {
    this.childModal?.hide();
    //this.editor.insertContent('&nbsp;<b>' + this.selectedFile + '</b>&nbsp;');
  }

  setLicences() {
    this.licencesModal?.show();
  }



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
    this.state.ctx!.licences = JSON.stringify(this.licences);

    this.service.saveMagazine(this.state.ctx!).subscribe(res => {
      // this.service.getMagazines().subscribe(res2 => {
      //   this.state.ctxs = res2['response']['docs'];
      // });
    });

    this.licencesModal?.hide();
  }

  showResetPwd() {
    this.resetpwdModal?.show();
  }

  resetPwd() {
    this.newPwdOk = false;
    if (this.newPwd !== '') {
      this.service.resetPwd(this.state.username, this.newPwd).subscribe(res => {
        if (res.error) {
          alert(res.error)
        } else {
          this.newPwdOk = true;
          this.resetpwdModal?.hide();
        }
      });
    }
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

  addMenu() {
    this.menu.push({
      id: 'menu_' + this.menu.length,
      route: 'menu_' + this.menu.length + '_new',
      cs: 'Nazev CS',
      en: 'Name EN',
      visible: true,
      children: []
    })
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

}

interface MenuItem {
  id: string,
  route: string,
  cs: string,
  en: string,
  visible: boolean,
  children: MenuItem[]
}
