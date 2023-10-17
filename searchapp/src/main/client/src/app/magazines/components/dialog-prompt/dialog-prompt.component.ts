import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatFormFieldModule, MatDialogModule],
  selector: 'app-dialog-prompt',
  templateUrl: './dialog-prompt.component.html',
  styleUrls: ['./dialog-prompt.component.scss']
})
export class DialogPromptComponent implements OnInit {

  result?: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {caption: string, label: string}) { }

  ngOnInit(): void {
  }

}
