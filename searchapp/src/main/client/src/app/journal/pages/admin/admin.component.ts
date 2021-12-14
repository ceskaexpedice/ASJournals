import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';


import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { FileUploader } from 'ng2-file-upload';
import { Router } from '@angular/router';
import { AppState } from 'src/app/app.state';
import { Magazine } from 'src/app/models/magazine';
import { AppService } from 'src/app/services/app.service';



declare var tinymce: any;

interface menuItem {
  route: string;
  visible: boolean;
};

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
  selected: string = 'home';
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

  newctx: string = '';

  currentMag: Magazine | null = null;
  tinyConfig: any;
  tinyInited = false;

  resultMsg: string = '';

  tab: string = 'config';
  cache: any = {};
  licences: any = {};

  newPwd = '';
  newPwdOk = false;

  ngOnInit() {
    this.subscriptions.push(this.state.configSubject.subscribe(val => {
      this.fillMenu();
      this.initTiny();

    }));

    if (this.state?.ctx?.licences && this.state?.ctx?.journal) {
      this.licences = JSON.parse(this.state.ctx.licences);
    }
    this.cache[this.state.ctx!.journal!] = { label: 'root', licence: '' };

    this.getChildren(this.state.ctx!.journal!, this.state.ctx);

  }

  constructor(
    public state: AppState,
    private service: AppService,
    private modalService: BsModalService,
    private router: Router) { }

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

    this.menu = [];
    for (let m in this.state.config['menu']) {
      this.menu.push({ label: m, menu: this.state.config['menu'][m]['submenu'], visible: this.state.config['menu'][m]['visible'] })
      //this.menu = this.state.config['menu'];
    }

    this.getText();
  }

  getText() {
    this.service.getText(this.selected).subscribe(t => {
      this.text = t;
      // this.editor.setContent(this.text);
    });
  }

  select(m: string, m1: string | null) {
    if (m1) {
      this.selected = m + '/' + m1;
    } else {
      this.selected = m;
    }
    this.saved = false;
    this.indexed = false;
    this.deleted = false;
    this.getText();
  }

  saveMenu() {
    let menuToSave: any = {};
    for (let i = 0; i < this.menu.length; i++) {
      menuToSave[this.menu[i].label] = { submenu: this.menu[i].menu, visible: this.menu[i].visible };
    }

    this.service.saveMenu(JSON.stringify(menuToSave)).subscribe((res: any) => {
      this.saved = !res.hasOwnProperty('error');
    });
  }

  save() {

    const content = this.editor.getContent();
    let m = null;
    if (this.visibleChanged) {
      let menuToSave: any = {};
      for (let i = 0; i < this.menu.length; i++) {
        menuToSave[this.menu[i].label] = { submenu: this.menu[i].menu, visible: this.menu[i].visible };
      }
      m = JSON.stringify(menuToSave);
    }
    this.service.saveText(this.selected, content, m).subscribe(res => {

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
    this.service.index(this.indexUUID!).subscribe(res => {
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
          this.newPwdOk = true;
          this.resetpwdModal?.hide();
        });
      }
  }

}
