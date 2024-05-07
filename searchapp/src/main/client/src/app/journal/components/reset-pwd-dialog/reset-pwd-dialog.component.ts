import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from 'src/app/services/app.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reset-pwd-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './reset-pwd-dialog.component.html',
  styleUrls: ['./reset-pwd-dialog.component.scss']
})
export class ResetPwdDialogComponent {
  
  newPwd = '';
  newPwdOk = false;

  constructor(private service: AppService,
    public dialogRef: MatDialogRef<ResetPwdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      username: string
    }){}

  resetPwd() {
    this.newPwdOk = false;
    if (this.newPwd !== '') {
      this.service.resetPwd(this.data.username, this.newPwd).subscribe(res => {
        if (res.error) {
          alert(res.error)
          this.service.showSnackBar('snackbar.error.changeSaved', 'desc.error', true);
        } else {
          this.newPwdOk = true;
          this.service.showSnackBar('snackbar.success.changeSaved');
          // this.resetpwdModal?.hide();
        }
      });
    }
  }
}
