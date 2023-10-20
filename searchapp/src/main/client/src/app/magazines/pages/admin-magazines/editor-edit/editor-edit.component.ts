import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MagazinesService } from 'src/app/magazines/magazines.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, FlexLayoutModule, 
    MatFormFieldModule, MatSelectModule,
    MatListModule, MatInputModule, MatCheckboxModule, MatOptionModule],
  selector: 'app-editor-edit',
  templateUrl: './editor-edit.component.html',
  styleUrls: ['./editor-edit.component.scss']
})
export class EditorEditComponent implements OnInit {

  @Input() editor: any;
  newKeyword: string = '';
  
  constructor(private service: MagazinesService) { }

  ngOnInit() {
  }

}
