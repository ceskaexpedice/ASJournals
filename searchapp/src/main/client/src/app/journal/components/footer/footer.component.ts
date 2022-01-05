import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  foot: SafeHtml | null = null;
  constructor(
    public state: AppState,
    private service: AppService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.state.ctx){
      this.service.getText('footer').subscribe((t: string) => {
        // this.foot = t;
        let s = t.replace('{{licence}}', this.state.ctx?.licence!);
        this.foot = this.sanitizer.bypassSecurityTrustHtml(s);
      }); 
    }
  }

}
