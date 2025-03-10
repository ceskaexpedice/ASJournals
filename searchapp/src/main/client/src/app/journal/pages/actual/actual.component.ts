import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { Journal } from 'src/app/models/journal.model';
import { AppService } from 'src/app/services/app.service';
import { ArticleResultComponent } from '../../components/article-result/article-result.component';
import { JournalDetailsComponent } from '../../components/journal-details/journal-details.component';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule,
    ArticleResultComponent, JournalDetailsComponent,
     MatButtonModule, MatDividerModule, MatIconModule],
  selector: 'app-actual',
  templateUrl: './actual.component.html',
  styleUrls: ['./actual.component.scss']
})
export class ActualComponent implements OnInit {

  img: string | null = null;
  actual: Journal | null = null;
  krameriusLink: string | null = null;
  pidActual: string | null = null;

  constructor(
    private config: Configuration,
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router
  ) {

    //this.actualNumber = this.store.select<Journal>('actual');
  }

  ngOnInit() {
    this.setData();

    this.state.stateChangedSubject.subscribe(
      () => {
        this.setData();
        //        this.findPid();
      }
    );
  }

  setData() {
    if (this.state.actualNumber) {
      this.actual = this.state.actualNumber;
      this.img = this.state.imgSrc;
      this.krameriusLink = this.config['k5'] + this.state.currentMagazine['journal'];
      //this.img = 'img/item/' + this.state.actualNumber.pid + '/thumb';
    }
  }

  findPid() {
    this.pidActual = null;
    this.findPidById(this.state.currentMagazine['journal']);
  }

  findPidById(pid: string) {
    this.service.getChildren(pid).subscribe(res => {
      if (res.length === 0) {
        this.pidActual = null;
        console.log('ERROR. Cannot find actual number');
      } else if (res[0]['datanode']) {
        this.pidActual = pid;
        this.service.getJournal(pid).subscribe(j => {
          this.actual = j;
        });
      } else {
        this.findPidById(res[0]['pid']);
      }
    });
  }

  gotoArchiv(pid: string) {
    this.router.navigate(['archiv/', pid], { queryParamsHandling: "preserve" })
  }

  isHiddenByGenre(genres: string[]) {
    return this.service.isHiddenByGenre(genres);
  }

  gotoArticle() {
    this.findFirstdatanode(this.actual?.pid!);
  }


  findFirstdatanode(pid: string) {
    this.service.getChildren(pid, 'asc').subscribe(res => {
      if (res[0]['datanode']) {
        this.router.navigate(['../article', res[0]['pid']], { queryParamsHandling: "preserve", relativeTo: this.route });
      } else {
        this.findFirstdatanode(res[0]['pid']);
      }
    });
  }



}
