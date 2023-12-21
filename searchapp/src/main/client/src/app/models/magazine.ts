/**
 * Represents one configured magazine 
 *  */
export class Magazine {
  ctx: string | undefined = undefined;
  journal: string | undefined = undefined;
  color: string | undefined = undefined;
  showTitleLabel: boolean = false;
  showOldYears: boolean = true;
  showExtLink: boolean = false;
  extLinkUrl: string = '';
  extLinkText: string = '';
  licence:string = '';
  licences:string | undefined = undefined;
  
  title: string | undefined = undefined;
  subtitle: string | undefined = undefined;
  title_en: string | undefined = undefined;
  subtitle_en: string | undefined = undefined;
  img: string | undefined = undefined;
  k5url: string | undefined = undefined;
  vydavatel: string | undefined = undefined;
  vydavatel_id: string | undefined = undefined;
  oblast: string[] = [];
  issn: string | undefined = undefined;
  pristup: string | undefined = undefined;
  kontakt: string | undefined = undefined;
  keywords: string[] = [];
  desc: string | undefined = undefined;
  desc_en: string | undefined = undefined;
  web: string | undefined = undefined;
  kramerius_version: string | undefined = undefined;
  isK7: boolean = false;
  sortByOrder: boolean = false;
  keepLang: boolean = false;
  checkUpdates: boolean = false;
  languages: string[] = [];
}
