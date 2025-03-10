import { Inject, Component, OnInit, ViewChild, HostListener, PLATFORM_ID, Injector, Optional } from '@angular/core';
import { Router, ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// import {PDFDocumentProxy, PDFPageProxy, PdfViewerComponent} from 'ng2-pdf-viewer';
import { AppState } from 'src/app/app.state';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import Utils from 'src/app/services/utils';
import { CommonModule, DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Configuration } from 'src/app/models/configuration';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { MatDividerModule } from '@angular/material/divider';
import { ArticleViewerArticlesComponent } from '../article-viewer-articles/article-viewer-articles.component';
import { AppWindowRef } from 'src/app/app.window-ref';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ShareDialogComponent } from '../../components/share-dialog/share-dialog.component';
import { Meta } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgxExtendedPdfViewerModule, 
    MatIconModule, MatTabsModule, MatDividerModule, MatDialogModule, ArticleViewerArticlesComponent, MatTooltipModule],
  selector: 'app-article-viewer',
  templateUrl: './article-viewer.component.html',
  styleUrls: ['./article-viewer.component.scss']
})
export class ArticleViewerComponent implements OnInit {


  breakpoint: number = 960;
  windowSize: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowSize = (event.target as Window).innerWidth;
    if (this.windowSize > this.breakpoint && this.state.viewerActiveLink === 'articles') {
      //this.router.navigate(['.', 'detail']);
      this.state.viewerActiveLink = 'detail';
      this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
    }
  }

  viewerPid: string | null = null;


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

  hideList = true;


  lang: string = 'cs';
  langsMap = {
    'cs': 'cze',
    'en': 'eng'
  };

  journal: Journal;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Optional() @Inject(REQUEST) private request: any,
    private injector: Injector,
    private windowRef: AppWindowRef,
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta,
    public dialog: MatDialog,
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

  setReferences() {
    this.state.viewerArticle.references = [];
    let relatedItem = this.mods['relatedItem'] || this.mods['mods:relatedItem'];
    if (relatedItem) {
      if (!Array.isArray(relatedItem)) {
        relatedItem = [relatedItem];
      }
      const refs: any[] = relatedItem.filter((r: any) => r.type === 'references');
      this.state.viewerArticle.hasReferences = refs.length > 0;
      if (this.state.viewerArticle.hasReferences) {
        refs.forEach(ref => {
          console.log(ref)
          // const ref = JSON.parse(JSON.stringify(refOrig).replaceAll('mods:', ''));
          let doi = '';
          if (ref['mods:identifier'] && ref['mods:identifier'].type === 'doi') {
            doi = 'DOI: ' +  ref['mods:identifier'].content + '.';
          }
          let isbn = '';
          if (ref['mods:identifier'] && ref['mods:identifier'].type === 'isbn') {
            isbn = 'ISBN: ' +  ref['mods:identifier'].content + '.';
          }
          if (ref['mods:note']) {
            this.state.viewerArticle.references.push(ref['mods:note']['content']);
          } else if (ref['note']) {
            this.state.viewerArticle.references.push(ref['note']['content']);
          } else {
            let name = this.makeName(ref).join('; ').trim();
            let note = `${name}.  
            ${ref['mods:titleInfo']?.['mods:title'] ? ref['mods:titleInfo']['mods:title'] : ''
            }${ref['mods:originInfo']?.['mods:place']?.['mods:placeTerm']['content'] ? ' ' + ref['mods:originInfo']['mods:place']['mods:placeTerm']['content'] + ':' : ''
            }${ref['mods:originInfo']?.['mods:publisher'] ? ' ' + ref['mods:originInfo']['mods:publisher']
              : ''}${ref['mods:originInfo']?.['mods:dateIssued'] ? ', ' + ref['mods:originInfo']['mods:dateIssued']  : ''}`
            if (ref['mods:titleInfo']?.['mods:title'] || ref['mods:originInfo']?.['mods:place']?.['mods:placeTerm']['content'] || ref['mods:originInfo']?.['mods:publisher']) {
              note += '. ';
            }
            if (ref['mods:relatedItem']?.type === 'host') {
              let name2 = this.makeName(ref['mods:relatedItem']).join('; ').trim();
              if (name2 !== '') {
                name2 = name2 + '.'
              }
              note += `${ref['mods:part'] ? 'In:' : ''} ${name2}
                          ${ref['mods:relatedItem']['mods:titleInfo']['mods:title'] ? 
                            ref['mods:relatedItem']['mods:titleInfo']['mods:title'] + '. ' : 
                            ''}
                            ${ref['mods:relatedItem']['mods:originInfo']?.['mods:place']?.['mods:placeTerm']['content'] ? 
                            ref['mods:relatedItem']['mods:originInfo']['mods:place']['mods:placeTerm'].content : 
                            ''}${ref['mods:relatedItem']['mods:originInfo']['mods:publisher'] ? ': ' + ref['mods:relatedItem']['mods:originInfo']['mods:publisher'] 
                              : ''}${ref['mods:relatedItem']['mods:originInfo']['mods:publisher'] && ref['mods:relatedItem']['mods:originInfo']['mods:dateIssued'] ?
                               ', ' : ''}${ref['mods:relatedItem']['mods:originInfo']['mods:dateIssued'] ? ref['mods:relatedItem']['mods:originInfo']['mods:dateIssued'] 
                              : ''}${ref['mods:relatedItem']['mods:part']?.['mods:detail'] && Array.isArray(ref['mods:relatedItem']['mods:part']['mods:detail']) ? 
                                ', roč. ' + ref['mods:relatedItem']['mods:part']['mods:detail'].find((d:any) => d.type === 'volume')['mods:number'] +
                                ', č. ' + ref['mods:relatedItem']['mods:part']['mods:detail'].find((d:any) => d.type === 'issue')['mods:number'] : 
                                ''}${ref['mods:relatedItem']['mods:part']?.['mods:detail'] && ref['mods:relatedItem']['mods:part']['mods:detail']['type'] === 'volume' ? 
                                  ', roč. ' + ref['mods:relatedItem']['mods:part']['mods:detail']['mods:number'] : 
                                  ''}${ref['mods:relatedItem']['mods:part']?.['mods:detail'] && ref['mods:relatedItem']['mods:part']['mods:detail']['type'] === 'issue' ? 
                                    ', č. ' + ref['mods:relatedItem']['mods:part']['mods:detail']['mods:number'] : 
                                    ''}${ref['mods:part']?.['mods:extent'] ? 
                                  ', s. ' + ref['mods:part']['mods:extent']['mods:start'] +
                                  '-' + (ref['mods:part']['mods:extent']['mods:end'] ? ref['mods:part']['mods:extent']['mods:end'] : '') : 
                                  ''}.
                            `;
            }
            note += `${doi}${isbn}`;
            this.state.viewerArticle.references.push(note);
          }
          
        })
      }
    } else {
      this.state.viewerArticle.hasReferences = false
    }
  }

  makeName(mods: any): string[] {
    let ret = [];
    //name/type="personal"	namepart/type="family"
        //name/type="personal"	namePart/type"given"
        if (mods.hasOwnProperty("mods:name")) {
          let name = mods["mods:name"];
          if (name.hasOwnProperty('length')) {
              for (let i in name) {
                  let namePart = name[i]["mods:namePart"];
                  let role = name[i]["mods:role"];
                  if (name[i]["type"] === 'personal' && namePart) {
                      //Chceme nejdriv prijmeni a potom jmeno
                      if (namePart[0]['type'] === 'family') {
                        ret.push(namePart[0]['content'] + ' ' + namePart[1]['content']);
                      } else {
                        ret.push(namePart[1]['content'] + ' ' + namePart[0]['content']);
                      }
                  }
              }
          } else {
              if (name["type"] === 'personal' && name.hasOwnProperty("mods:namePart")) {
                  let namePart = name["mods:namePart"];
                  if (typeof namePart === 'string') {
                    ret.push(namePart);
                  } else {
                      if (typeof namePart[0] === 'string') {
                        ret.push(namePart[0]);
                      } else {
                          //Chceme nejdriv prijmeni a potom jmeno
                          if (namePart[0]['type'] === 'family') {
                            ret.push(namePart[0]['content'] + ' ' + namePart[1]['content']);
                          } else {
                            ret.push(namePart[1]['content'] + ' ' + namePart[0]['content']);
                          }
                      }
                  }
              }
          }

      }
      return ret;
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

    this.service.getItem(this.state.viewerPid, true).subscribe(res => {

      if (res['doc']['datanode']) {
        this.state.viewerArticle = res['doc'];

        this.pagesRendered = 0;
        this.numPages = -1;

        if (this.state.viewerArticle.hasOwnProperty('url_pdf')) {
          this.state.isPdf = true;
          const title = this.state.viewerArticle['title'];
          if (title) {
            this.downloadFilename = title.substring(0, 30) + '.pdf';
          } else {
            this.downloadFilename = this.state.viewerPid + '.pdf';
          }
        } else {
          this.state.isPdf = false;
          this.downloadFilename = this.state.viewerPid;
          this.loading = false;
        }
        this.state.fullSrc = this.config['context'] + 'api/img?uuid=' + this.state.viewerPid + '&kramerius_version=' + res['doc']['kramerius_version'];
        this.mods = this.state.viewerArticle['mods'];
        this.setReferences();

        // this.doi = Utils.getDoi(this.mods);
        // let ctx = res['context'][0];
        //        let parent = ctx[ctx.length - 2]['pid'];


        const parentPid = res['parent']['doc'].pid;
        if (!this.state.viewerJournal || this.state.viewerJournal.pid !== parentPid) {
          this.state.viewerJournal = Utils.journalFromResp(res['parent']['doc']);
          //this.service.getJournal(parent).subscribe((a: any) => {

          //if (a.pid) {
          //this.state.viewerJournal = a;
          //this.service.getMods(a['pid']).subscribe(mods => {
          //this.state.viewerJournal.mods = mods;

          this.service.getArticles(parentPid).subscribe((res: any) => {
            this.state.viewerJournal.setArticles(res, this.config['mergeGenres']);
          });

          //});
          //this.service.getSiblings(a['pid']).subscribe(siblings => {
          this.service.getChildren(parentPid, 'asc').subscribe(siblings => {
            this.state.viewerJournal.siblings = siblings;
            //console.log(siblings);
            for (let i = 0; i < this.state.viewerJournal.siblings.length; i++) {
              if (this.state.viewerJournal.siblings[i]['pid'] === this.state.viewerJournal.pid) {
                this.siblingIndex = i;
                break;
              }
            }
          });
          //}

          //});
        }
      } else {
        this.findFirstdatanode(this.state.viewerPid!);
      }
      this.setMetaTags(res);
      this.settingData = false;

      if (this.windowSize > this.breakpoint && this.state.viewerActiveLink === 'articles') {
        //this.router.navigate(['.', 'detail']);
        this.state.viewerActiveLink = 'detail';
        this.router.navigate(['/' + this.state.currentMagazine?.ctx + '/article', this.state.viewerPid, 'pdf'], { queryParamsHandling: 'preserve' });
      }

      
      this.service.details(this.state.viewerJournal['mods'], this.state.viewerJournal['model'], this.state.viewerJournal.parent);
      this.state.stateChanged();

    });
  }

  setMetaTags(res: any) {
    let url = '';
    if (isPlatformServer(this.platformId)) {
      let req = this.injector.get(REQUEST);
      // console.log("locales from crawlers: " + req.headers["accept-language"]);
      // console.log("host: " + req.get('host'));
      // console.log("headers: ", req.headers);
      url = 'http://' + req.headers['x-forwarded-host'];
      console.log(url);
    } else {
        url = this.document.location.origin;
    }

    const tags: { name: string, content: string }[] = [];
    if (this.state.viewerArticle.abstract) {
      tags.push({ name: 'abstract', content: this.state.viewerArticle.abstract });
    }

    if (this.state.viewerArticle['autor_full']) {
      tags.push({ name: 'citation_author', content: this.state.viewerArticle['autor_full'].filter((a: any) => a.role !== 'trl').map((a: any) => a.name) });
    }

    const pv = Utils.findByModel(res, 'periodicalvolume');
    if (pv !== null) {
      tags.push({ name: 'citation_volume', content: this.state.viewerArticle.year }); // model:periodicalvolume	titleInfo/partNumber
    }

    const pi = Utils.findByModel(res, 'periodicalitem');
    if (pi !== null) {
      const issueNumber = pi.mods['mods:titleInfo']['mods:partNumber'];
      tags.push({ name: 'citation_issue', content: issueNumber }); // model:periodicalitem	titleInfo/partNumber  
    }

    const rozsah = Utils.getRozsah(this.state.viewerArticle.mods);
    if (rozsah !== null) {
      tags.push({ name: 'citation_firstpage', content: rozsah.split('-')[0].trim() });
      tags.push({ name: 'citation_lastpage', content: rozsah.split('-')[1].trim() });
    }

    tags.push(
      { name: 'citation_title', content: this.state.viewerArticle.title },
      { name: 'citation_pdf_url', content: url + this.state.fullSrc },
      { name: 'citation_publication_date', content: this.state.viewerArticle.dateIssued },
      { name: 'citation_journal_title', content: this.state.viewerArticle.root_title },
      { name: 'citation_issn', content: this.state.currentMagazine.issn }
    )
    this.meta.addTags(tags);

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
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: '700px',
      data: { url: this.url(), doi: Utils.getDoi(this.mods) },
      panelClass: 'app-register-dialog'
    });
  }

  public showCitace() {

  }





}
