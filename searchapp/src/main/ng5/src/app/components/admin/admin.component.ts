import {Component, OnInit, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';


import {BsModalService, ModalDirective} from 'ngx-bootstrap/modal';
//import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {FileUploader} from 'ng2-file-upload';

import {AppService} from '../../services/app.service';
import {AppState} from '../../app.state';
import {Router} from '@angular/router';
import {Magazine} from 'app/models/magazine';


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

  @ViewChild('filesModal') filesModal;
  @ViewChild('childModal') public childModal: ModalDirective;


  subscriptions: Subscription[] = [];

  public uploader: FileUploader = new FileUploader({url: 'lf?action=UPLOAD'});
  public coverUploader: FileUploader = new FileUploader({url: 'lf?action=UPLOAD&cover=true'});

  //public modalRef: BsModalRef;

  menu: any[] = [];
  selected: string = 'home';
  visibleChanged: boolean = false;
  saved: boolean = false;

  text: string;
  elementId: string = 'editEl';
  editor;

  fileList: string[];
  selectedFile: string;

  working: boolean = false;
  indexUUID: string;
  indexed: boolean = false;
  coverMsg: string;

  newctx: string = '';
  
  currentMag : Magazine;

  ngOnInit() {
    this.subscriptions.push(this.state.configSubject.subscribe(val => {
      this.fillMenu();
      this.initTiny();
    }));
  }

  constructor(
    public state: AppState,
    private service: AppService,
    private modalService: BsModalService,
    private router: Router) {}

  ngAfterViewInit() {
    if (this.state.config) {
      setTimeout(() => {
        this.fillMenu();
        this.initTiny();
      }, 100);
    }
  }
  
/*
  
//  editJournal(){
//    const initialState = {
//      mag: this.state.ctx
//    };
//    let bsModalRef = this.modalService.show(MagazineEditComponent, {initialState});
//    //bsModalRef.content.closeBtnName = 'Close';
//  }

  deleteJournal() {
    var c = confirm('Delete journal "'+this.state.ctx.ctx+'"?');
    if (c == true) {
      let idx = -1;
      for (let i = 0; i < this.state.ctxs.length; i++){
        if(this.state.ctxs[i].ctx === this.state.ctx.ctx){
          idx = i;
          break;
        }
      }
      if(idx > -1){
        this.state.ctxs.splice(idx, 1);
        this.service.saveJournalConfig().subscribe(res => {
          this.newctx = '';
          this.service.getJournalConfig(this.state.ctxs[0]).subscribe(res => {
            //this.save();
            this.router.navigate([this.state.ctxs[0].ctx, 'admin']);
          });
        });
      }

    } else {
      console.log('cancel');
    }
  }

  renameJournal() {
    var c = prompt('New name for context of journal "'+this.state.ctx.ctx+'"?');
    if (c !== null) {
      this.state.ctx.ctx = c;
      
        this.service.saveJournalConfig().subscribe(res => {
          this.newctx = '';
          this.service.getJournalConfig(this.state.ctx).subscribe(res => {
            //this.save();
            this.router.navigate([this.state.ctx.ctx, 'admin']);
          });
        });
      

    } else {
      console.log('cancel');
    }
  }

  setCtx(ctx: {ctx: string; color: string; journal: string; showTitleLabel: boolean;}) {
    this.router.navigate([ctx['ctx'], 'admin']);
  }
*/

  initData() {

    this.subscriptions.push(this.service.langSubject.subscribe(val => {
      this.getText();
    }));

  }

  initTiny() {

    var that = this;
    tinymce.init({
      selector: '#' + this.elementId,
      menubar: false,
      plugins: ['link', 'paste', 'table', 'save', 'code', 'image'],
      toolbar: 'save | undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code mybutton',
      skin_url: this.state.config['context'] + 'assets/skins/lightgray',
      images_upload_url: 'lf?action=UPLOAD&isImage=true&ctx=' + this.state.ctx.ctx,
      automatic_uploads: true, 
      relative_urls : false,
      setup: editor => {
        this.editor = editor;
        this.initData();
        editor.addButton('mybutton', {
          tooltip: 'Insert link to file',
          icon: 'upload',
          //icon: false,
          onclick: function () {
            that.browseFiles();
            //editor.insertContent('&nbsp;<b>It\'s my button!</b>&nbsp;');
          }
        });
      },
      
      

      save_oncancelcallback: function () {console.log('Save canceled');},
      save_onsavecallback: () => this.save()
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

    this.menu = [];
    for (let m in this.state.config['menu']) {
      this.menu.push({label: m, menu: this.state.config['menu'][m]['submenu'], visible: this.state.config['menu'][m]['visible']})
      //this.menu = this.state.config['menu'];
    }

    this.getText();
  }

  getText() {
    this.service.getText(this.selected).subscribe(t => {
      this.text = t;
      this.editor.setContent(this.text);
    });
  }

  select(m: string, m1: string) {
    if (m1) {
      this.selected = m + '/' + m1;
    } else {
      this.selected = m;
    }
    this.saved = false;
    this.indexed = false;
    this.getText();
  }
  
  saveMenu(){
    let menuToSave = {};
    for (let i = 0; i < this.menu.length; i++) {
      menuToSave[this.menu[i].label] = {submenu: this.menu[i].menu, visible: this.menu[i].visible};
    }
    
    this.service.saveMenu(JSON.stringify(menuToSave)).subscribe(res => {
      this.saved = !res.hasOwnProperty('error');
    });
  }

  save() {

    const content = this.editor.getContent();
    let m = null;
    if (this.visibleChanged) {
      let menuToSave = {};
      for (let i = 0; i < this.menu.length; i++) {
        menuToSave[this.menu[i].label] = {submenu: this.menu[i].menu, visible: this.menu[i].visible};
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
    this.service.index(this.indexUUID).subscribe(res => {
      console.log(res);
      this.indexed = !res.hasOwnProperty('error');
      this.working = false;
    });
  }

  uploadFile() {

    this.uploader.setOptions({url: 'lf?action=UPLOAD&ctx=' + this.state.ctx.ctx});
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
    this.coverUploader.setOptions({url: 'lf?action=UPLOAD&cover=true&ctx=' + this.state.ctx.ctx});
    this.coverUploader.onSuccessItem = (item, response, status, headers) => this.coverUploaded();
    this.coverUploader.uploadAll();
  }

  coverUploaded() {
    this.coverMsg = 'ok';
  }

  public selectFile(f: string) {
    this.selectedFile = f;

    this.childModal.hide();
    const link = this.state.config['context'] + 'lf?action=GET_FILE&ctx=' + this.state.ctx.ctx;
    console.log(link);
    this.editor.insertContent('&nbsp;<a target="_blank" href="' + link + '&filename=' + this.selectedFile + '">' + this.selectedFile + '</a>&nbsp;');
  }

  public browseFiles() {
    this.service.getUploadedFiles().subscribe(res => {
      this.fileList = res['files'];
    });

    this.childModal.show();
  }

  public closeFiles() {
    this.childModal.hide();
    //this.editor.insertContent('&nbsp;<b>' + this.selectedFile + '</b>&nbsp;');
  }

}
