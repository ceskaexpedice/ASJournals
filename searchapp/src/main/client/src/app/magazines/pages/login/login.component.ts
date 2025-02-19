import { Component, OnInit, ViewChild } from '@angular/core';
import { MagazineState } from '../../magazine.state';
import { MagazinesService } from '../../magazines.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, MatIconModule, MatCardModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatButtonModule], 
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  @ViewChild('loginuser') loginuser: any;
  loginError: boolean = false;

  constructor(
    public state: MagazineState,
    public service: MagazinesService) { }

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
