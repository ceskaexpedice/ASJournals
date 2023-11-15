import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'src/app/app.state';
import { Configuration } from 'src/app/models/configuration';
import { AppService } from 'src/app/services/app.service';


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, TranslateModule, MatInputModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  constructor(
    private config: Configuration,
    public state: AppState,
    public service: AppService) { }

  ngOnInit() {
    this.focusu();
  }

  focusu(){
    setTimeout(() => {
        this.loginuser.nativeElement.focus();
      }, 100);

  }

  focusp(e: any, el: any){
      el.focus();
  }

}
