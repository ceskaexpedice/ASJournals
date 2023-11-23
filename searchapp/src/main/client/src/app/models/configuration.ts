import { Injectable } from "@angular/core";



@Injectable()
export class Configuration {
  context: string;
  defaultLang: string;
  journal: string;
  api_point: string;
  k5: string;
  color: string;
  showTitleLabel: boolean | any;
  showExtLink: boolean | any;
  sorts: {
    label: string,
    field: string
  }[];
  mergeGenres: {[key: string]: string};
  hiddenGenres: string[];
  layout: any;
  home_en: string;
  home_cs: string;

  fromJSON(obj: any) {
    Object.keys(obj).forEach((key) => {
      this[key as keyof Configuration] = obj[key];
    })
  }

  setLayout(layout: any) {
    this.layout = layout;
    this.home_cs = layout.home_cs;
    this.home_en = layout.home_en;
  }

}


