import { Inject, Component, OnInit, ViewChild, HostListener, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// import {PDFDocumentProxy, PDFPageProxy, PdfViewerComponent} from 'ng2-pdf-viewer';
import { AppState } from 'src/app/app.state';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { MatDividerModule } from '@angular/material/divider';
import { ArticleViewerArticlesComponent } from '../article-viewer-articles/article-viewer-articles.component';
import { AppWindowRef } from 'src/app/app.window-ref';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgxExtendedPdfViewerModule,
    MatIconModule, MatTabsModule, MatDividerModule, ArticleViewerArticlesComponent],
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.component.html',
  styleUrls: ['./article-viewer.component.scss']
})
export class ArticleViewerComponent implements OnInit {
  // @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent | null = null;
  @ViewChild('linkModal') private linkModal: any;
  @ViewChild('citaceModal') private citaceModal: any;
  @ViewChild('tabss') tabss: any;


  activeLink = 'pdf';
  breakpoint: number = 960;
  windowSize: number;

  // ---- tohle je pokus, ktery se muze smazat, jde o to, ze bychom pri viewportu mensim nez 960px, nemeli vubec zobrazit element tab "articles" + vubec bychom nemeli zobrazit jeho obsah
  // takze by pri resize okna nazpatek mel zmizet jak tab "articles", tak jeho obsah a zova by se mel aktivovat defaultni "detail" pokud si prave prepnuty na tab articles behem zvetsovani okna
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowSize = (event.target as Window).innerWidth;
    if (this.windowSize > this.breakpoint && this.activeLink === 'articles') {
      //this.router.navigate(['.', 'detail']);
      this.activeLink = 'pdf';
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
    }
  }

  viewerPid: string | null = null;
  article: any;

  loading = true;

  downloadFilename: string | null = null;
  pagesRendered = 0;
  numPages = -1;

  zoom = 1.0;

  siblingIndex: number = 0;
  isPrintSupported = false;
  showShare = false;
  settingData = false;

  mods: any;
  doi: string | null = null;
  citace: string | null = null;
  location: string | null = null;

  hideList = true;


  lang: string = 'cs';
  langsMap = {
    'cs': 'cze',
    'en': 'eng'
  };

  magazine: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private windowRef: AppWindowRef,
    @Inject(DOCUMENT) private document: Document,
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router) {

    // this.afterLoad = this.afterLoad.bind(this);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.windowSize = this.windowRef.nativeWindow.innerWidth;
    } else {
      this.windowSize = 2000;
    }

    const parts = this.document.location.href.split('/');
    this.activeLink = parts[parts.length - 1];

    this.route.params
      .subscribe((params: Params) => {
        this.state.viewerPid = params['pid'];
        if (this.config) {
          this.hideList = true;
          this.setData();
        }

      });

    this.lang = this.state.currentLang;
    this.service.langSubject.subscribe(
      (lang) => {
        this.lang = lang;
        this.setData();

      }
    );

  }

  setData() {
    if (this.settingData) {
      return;
    }

    if (!this.state.viewerPid) {
      return;
    }
    this.settingData = true;
    this.state.fullSrc = null;
    this.loading = true;
    this.service.setViewed(this.state.viewerPid).subscribe(res => {
      //console.log('viewed!');
    });

    this.service.getItem(this.state.viewerPid).subscribe(res => {

      if (res['datanode']) {
        this.getCitace();
        this.article = res;

        this.pagesRendered = 0;
        this.numPages = -1;

        if (this.article.hasOwnProperty('url_pdf')) {
          this.state.isPdf = true;
          const title = this.article['title'];
          if (title) {
            this.downloadFilename = title.substring(0, 30) + '.pdf';
          } else {
            this.downloadFilename = this.state.viewerPid + '.pdf';
          }

          this.state.fullSrc = this.config['context'] + 'api/img?uuid=' + this.state.viewerPid + '&kramerius_version=' + res['kramerius_version'];
        } else {
          this.state.isPdf = false;
          this.downloadFilename = this.state.viewerPid;
          this.state.fullSrc = this.config['context'] + 'api/img?uuid=' + this.state.viewerPid + '&kramerius_version=' + res['kramerius_version'];
          this.loading = false;
        }

        this.mods = JSON.parse(this.article['mods']);

        this.doi = Utils.getDoi(this.mods);
        // let ctx = res['context'][0];
        //        let parent = ctx[ctx.length - 2]['pid'];
        const parent = res['parents'][0];
        if (!this.state.viewerJournal || this.state.viewerJournal.pid !== parent) {
          this.service.getJournal(parent).subscribe((a: any) => {

            if (a.pid) {
              this.state.viewerJournal = a;
              this.service.getMods(a['pid']).subscribe(mods => {
                this.state.viewerJournal.mods = mods;

                this.service.getArticles(a['pid']).subscribe((res: any) => {
                  // this.articles = res['response']['docs'];
                  this.state.viewerJournal.setArticles(res, this.config['mergeGenres']);
                });

              });
              //this.service.getSiblings(a['pid']).subscribe(siblings => {
              this.service.getChildren(a['parent'], 'asc').subscribe(siblings => {
                this.state.viewerJournal.siblings = siblings;
                //console.log(siblings);
                for (let i = 0; i < this.state.viewerJournal.siblings.length; i++) {
                  if (this.state.viewerJournal.siblings[i]['pid'] === this.state.viewerJournal.pid) {
                    this.siblingIndex = i;
                    break;
                  }
                }
              });
            }

          });
        }
      } else {
        this.findFirstdatanode(this.state.viewerPid!);
      }
      this.settingData = false;


      if (this.windowSize > this.breakpoint && this.activeLink === 'articles') {
        //this.router.navigate(['.', 'detail']);
        this.activeLink = 'pdf';
        this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
      }

    });
  }

  findFirstdatanode(pid: string) {
    this.service.getChildren(pid, 'asc').subscribe(res => {
      if (res[0]['datanode']) {
        this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', res[0]['pid']], { queryParamsHandling: 'preserve' });
      } else {
        this.findFirstdatanode(res[0]['pid']);
      }
    });
  }

  searchInPdf() {
    // if (this.state.fulltextQuery !== '' && this.pdfComponent) {
    //   this.pdfComponent.pdfFindController.executeCommand('find', {
    //     caseSensitive: false, findPrevious: undefined, highlightAll: true, phraseSearch: false, query: this.state.hlTerms.join(' ')
    //   });
    // }
  }

  pageRendered(e: any) {
    //console.log('(page-rendered)', e);
    this.pagesRendered++;
    if (this.pagesRendered === this.numPages) {
      this.searchInPdf();
    }

  }

  zoomIn() {
    this.zoom = this.zoom + .5;
  }

  zoomOut() {
    this.zoom = this.zoom - .5;
  }

  minimize() {
    this.state.fullScreenChanged(false);
  }

  maximize() {
    this.state.fullScreenChanged(true);
  }

  next() {
    if (this.hasNext()) {
      const pid = this.state.viewerJournal.siblings[this.siblingIndex + 1]['pid'];
      // this.journal = null;
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', pid], { queryParamsHandling: 'preserve' });
    }
  }

  prev() {
    if (this.hasPrev()) {
      const pid = this.state.viewerJournal.siblings[this.siblingIndex - 1]['pid'];
      // this.journal = null;
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', pid], { queryParamsHandling: 'preserve' });
    }
  }

  toggleShare() {
    this.showShare = !this.showShare;
  }

  hasNext() {
    if (this.state.viewerJournal.siblings) {
      return this.siblingIndex < this.state.viewerJournal.siblings.length - 1;
    } else {
      return false;
    }
  }

  hasPrev() {
    return this.siblingIndex > 0;
  }

  url() {
    //return window.location.href;
    return this.document.location.href;
  }

  _socialUrl() {
    //return window.location.href;
    return this.document.location.href;
  }

  facebookShare() {
    const share = 'https://www.facebook.com/sharer/sharer.php?u=' + this._socialUrl();
    window.open(share, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
    this.toggleShare();
    return false;
  }

  linkShare() {
    this.linkModal.show();
    this.toggleShare();
  }

  public showCitace() {
    // this.getCitace();
    this.citaceModal.show();
  }


  getCitace() {
    this.service.getCitace(this.state.viewerPid!).subscribe(resp => {
      this.citace = resp;
      this.location = this.document.location.href;
    });
  }


}
