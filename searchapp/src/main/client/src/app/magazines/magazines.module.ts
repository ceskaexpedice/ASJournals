import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeznamCasopisuComponent } from './components/seznam-casopisu/seznam-casopisu.component';
import { MagazinesComponent } from './pages/magazines/magazines.component';
import { ContextComponent } from './context/context.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MagazinesRoutingModule } from './magazines-routing.module';
import { AuthGuard } from '../services/auth-guard';
import { MagazineState } from './magazine.state';
import { MagazinesService } from './magazines.service';



@NgModule({
  declarations: [
    SeznamCasopisuComponent,
    MagazinesComponent,
    ContextComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    MagazinesRoutingModule,
  ],
  providers: [MagazineState, MagazinesService, AuthGuard],
})
export class MagazinesModule { }
