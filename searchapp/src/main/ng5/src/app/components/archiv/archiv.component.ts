import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { AppService } from '../../services/app.service';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-archiv',
  templateUrl: './archiv.component.html',
  styleUrls: ['./archiv.component.scss']
})
export class ArchivComponent implements OnInit {

  currentPid: string;
  currentItem: any;
  items: any[];
  parentItems: any[];

  visibleItems: number = 3;
  visibleParentItems: any[];
  currentParent: string = null;
  cache: any = {};

  isDataNode: boolean = false;

  volumeNumber: string;
  issueNumber: string;
  partName: string;

  sorts = [
    { label: "od nejnovějšího", dir: "desc" },
    { label: "od nejstaršího", dir: "asc" }
  ];
  currentSort = this.sorts[0];

  constructor(
    private service: AppService,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    //this.initData();
    this.route.params
      .switchMap((params: Params) => Observable.of(params['pid'])).subscribe(pid => {
        if (pid) {
          this.currentPid = pid;
          if (this.state.config) {
            this.setItems(pid);
          }
        } else {
          this.currentPid = null;
          this.initData();
        }
      });

    this.state.configSubject.subscribe(
      () => {
        this.initData();
      }
    );
  }

  setMainClass() {

    let sufix = this.isRoot() ? '-level-1' : '-level-2';
    this.state.mainClass = 'app-page-archiv' + sufix;
    this.state.classChanged();
  }

  isRoot() {
    return this.state.config && this.currentPid === this.state.config['journal'];
  }

  goToRoot() {
    this.parentItems = [];
    this.setItems(this.state.config['journal']);
    let p = {};
    p['pid'] = this.state.config['journal'];
    this.router.navigate(['.', p], { queryParamsHandling: "preserve", relativeTo: this.route });
  }
  setSort(s) {
    this.currentSort = s;
    let x = s.dir === 'asc' ? 1 : -1;
    this.items.sort((a, b) => {
      return (a['idx'] - b['idx']) * x;
    });
  }

  drillDown(pid: string) {

    let p = {};
    p['pid'] = pid;
    //this.router.navigate(['/archiv', p]);
    this.router.navigate(['.', p], { queryParamsHandling: "preserve", relativeTo: this.route });
    //    this.setItems(pid);
  }

  setFocus() {
    let el = document.getElementById('btn_' + this.currentPid);
    if (el) {
      el.focus();
    }
  }

  setItems(pid: string) {

    this.currentPid = pid;

    this.setMainClass();

    this.service.getItem(this.currentPid).subscribe(res => {
      if (this.currentPid === this.state.config['journal']) {
        this.currentItem = { pid: this.currentPid, parents: null, model: 'periodical' };
      } else {
        this.currentItem = res;

        if (res['parents'].length > 0) {
          this.currentParent = res['parents'][0];
        } else {
          this.currentParent = null;
        }
        this.setDetails();
      }

      if (!this.cache.hasOwnProperty(this.currentPid)) {
        this.service.getChildren(this.currentPid).subscribe(res => {
          this.isDataNode = res[0]['datanode'];

          this.cache[this.currentPid] = { items: res, parent: this.currentParent };
          this.items = res;

          if (this.currentParent === null) {
            this.parentItems = [];
          } else if (this.cache.hasOwnProperty(this.currentParent)) {
            this.parentItems = this.cache[this.currentParent]['items'];
          } else {
            this.parentItems = [];
            this.service.getChildren(this.currentParent).subscribe(res => {
              this.parentItems = res;
              this.cache[this.currentParent] = { items: res };
              this.setVisibleParentsItems();
            });
          }

          if (this.isDataNode) {
            this.items.sort((a, b) => {
              return a['idx'] - b['idx'];
            });
          }
          this.setVisibleParentsItems();

        });
      } else {
        this.items = this.cache[this.currentPid]['items'];
        this.isDataNode = this.items[0]['datanode'];
        let p = this.cache[this.currentPid]['parent'];
        if (this.cache.hasOwnProperty(p)) {
          this.parentItems = this.cache[p]['items'];
          this.currentParent = p;
        } else {
          this.parentItems = [];
          this.currentParent = null;
        }
      }

      this.setVisibleParentsItems();


    });
    this.setFocus();
  }

  setVisibleParentsItems() {
    this.visibleParentItems = [];
    if (this.parentItems && this.parentItems.length > 0) {
      let start = 0;
      for (let idx = 0; idx < this.parentItems.length; idx++) {
        if (this.parentItems[idx].pid === this.currentPid) {
          start = idx;
        }
      }

      // visibleItems should be odd

      start = Math.max(0, start - Math.floor(this.visibleItems / 2));

      let end = Math.min(start + this.visibleItems, this.parentItems.length);
      start = Math.max(0, end - this.visibleItems);
      for (let i = start; i < end; i++) {
        this.visibleParentItems.push(this.parentItems[i]);
      }
    }
  }

  initData() {
    if (this.state.actualNumber) {
      if (!this.currentPid) {
        this.setItems(this.state.config['journal']);
      } else {
        this.setItems(this.currentPid);
      }
    } else {
      //this.router.navigate(['home']);
      setTimeout(() => {
        this.initData();
      }, 100);
    }
  }

  isHiddenByGenre(genres: string[]) {
    return this.service.isHiddenByGenre(genres);
  }

  setDetails() {
    let mods = JSON.parse(this.currentItem['mods']);
    if (this.currentItem['model'] === 'periodicalvolume') {

      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          this.volumeNumber = mods['mods:titleInfo']['mods:partNumber'];
        }
      } else {
        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['date']) {
          //this.year = mods['part']['date'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:date']) {
          //this.year = mods['mods:part']['mods:date'];
        }

        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          this.issueNumber = mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
        }
      }
    } else if (this.currentItem['model'] === 'periodicalitem') {
      if (mods['mods:originInfo']) {
        //this.year = mods['mods:originInfo']['mods:dateIssued'];
        if (mods['mods:titleInfo']) {
          this.issueNumber = mods['mods:titleInfo']['mods:partNumber'];
          this.partName = mods['mods:titleInfo']['mods:partName'];
        }
      } else {


        //podpora pro starsi mods. ne podle zadani
        if (mods['part'] && mods['part']['detail'] && mods['part']['detail']['number']) {
          this.issueNumber = mods['part']['detail']['number'];
        } else if (mods['mods:part'] && mods['mods:part']['mods:detail'] && mods['mods:part']['mods:detail']['mods:number']) {
          this.issueNumber = mods['mods:part']['mods:detail']['mods:number'];
        }


      }
    }
  }


  img(pid: string) {
    return this.state.config['context'] + 'img?uuid=' + pid + '&stream=IMG_THUMB&action=SCALE&scaledHeight=140';

    var infos = new Array();
    infos[0] = 'Přilétáme na São Miguel, pod námi Vila Franca'; infos[1] = 'São Miguel, odvážné mosty na pobřeží';
    infos[2] = 'hlavní město ostrova, Ponta Delgada'; infos[3] = 'podvečer v Ponta Delgada'; infos[4] = '...'; infos[5] = 'pevnost São Brás, Ponta Delgada'; infos[6] = 'psychedelický domek u místní nemocnice'; infos[7] = 'vlajka Azorských ostrovů'; infos[8] = 'Ponta Delgada, věž farního kostela'; infos[9] = 'farní kostel sv. Šebestiána'; infos[10] = 'Ponta Delgada, radnice'; infos[11] = 'Ponta Delgada, ulička za radnicí'; infos[12] = 'městská brána na náměstí Gonçalo Velho Cabral'; infos[13] = 'Ponta Delgada, kašna na náměstí Vasco de Gama'; infos[14] = 'kostel sv. Petra na konci nábřežní promenády'; infos[15] = 'kostel s vyhlídkou nad Ponta Delgada'; infos[16] = 'tradiční domy s balkony v Ponta Delgada'; infos[17] = 'Ponta Delgada, typická ulička'; infos[18] = 'básník Anthero de Quental mezi Rozumem a Citem'; infos[19] = 'portál bývalého jezuitského kostela, nyní muzea'; infos[20] = 'kachlíky v sousedství retabla'; infos[21] = 'největší retablo v Portugalsku v muzeu'; infos[22] = 'detail bohaté dřevořezby retabla'; infos[23] = 'detail dřevořezby'; infos[24] = 'kachlíková výzdoba v kostele sv. Josefa'; infos[25] = 'retablo čili oltářní stěna v kostele sv. Josefa'; infos[26] = 'detail oltáře v kostele sv. Josefa'; infos[27] = 'Kristus zázraků v klášteře Panny Marie Naděje'; infos[28] = 'azorské ananasy ve zdejší tržnici'; infos[29] = 'údolí Ribeira dos Caldeirães'; infos[30] = 'mlýny v údolí potoka'; infos[31] = 'mlýnský náhon v Ribeira dos Caldeirães'; infos[32] = 'muzem z bývalého mlýna'; infos[33] = 'mostek přes potok - ribeiru'; infos[34] = 'stromová kapradina tamtéž'; infos[35] = 'vodopád v údolí Ribeira dos Caldeirães '; infos[36] = 'příchod do městečka Nordeste'; infos[37] = 'městečko Nordeste'; infos[38] = 'náměstíčko v Nordeste'; infos[39] = 'botanická úprava na vyhlídce Ponta do Sossego'; infos[40] = 'naše skupina na vyhlídce Vista dos Barcos'; infos[41] = 'kalokvěty na vyhlídce'; infos[42] = 'vyhlídka z Vista dos Barcos na maják a rybářský přístav'; infos[43] = 'vyhlídka Ponta do Sossego'; infos[44] = 'pohled na druhou stranu z Ponta do Sossego'; infos[45] = '...a pohled do vnitrozemí'; infos[46] = 'sedm "prstů," Lombas nad Povoação'; infos[47] = 'Kamenný Jindřich Mořeplavec v Povoação'; infos[48] = 'Povoação, kamenná růžice v přístavu'; infos[49] = 'Povoação, lodní šroub ze ztroskotavší lodi'; infos[50] = 'útesy u Povoação'; infos[51] = 'Povoação, nejstarší kostelík na Azorech'; infos[52] = 'ulička v Povoação'; infos[53] = 'Povoação'; infos[54] = 'Lombas nad Povoação z vyhlídky Salto do Cavalo'; infos[55] = 'kousek obří kaldery nad Furnas, Salto do Cavalo'; infos[56] = 'Furnas z vyhlídky Salto do Cavalo'; infos[57] = 'kvetoucí delonix nad mořem, Ponta Garça'; infos[58] = '...'; infos[59] = 'koupel v mořském bazénu, Ponta Garça'; infos[60] = 'Lagoa do Fogo'; infos[61] = 'Lagoa do Fogo'; infos[62] = 'hrana kaldery u Lagoa do Fogo'; infos[63] = 'Ribeira Grande, pohled od Lagoa do Fogo'; infos[64] = 'stromové kapradiny v Caldeira Velha'; infos[65] = 'Caldeira Velha, bublající bazének'; infos[66] = '...'; infos[67] = 'termální bazén, Caldeira Velha'; infos[68] = 'Ribeira Grande, kostel Ducha svatého'; infos[69] = 'Ribeira Grande, radnice'; infos[70] = 'Ribeira Grande'; infos[71] = 'pohled od kostela k památníku Gaspara Frutuosa'; infos[72] = 'stoupáme ke kostelu Panny Marie Hvězdné'; infos[73] = '...'; infos[74] = 'kvetoucí Delonix v Ribeira Grande'; infos[75] = 'pohled z vyhlídky Sant' Iría';infos[76] = '...a na opačnou stranu';infos[77] = 'sušení čaje na plantáži Gorreana';infos[78] = 'historická sušička čaje, Gorreana';infos[79] = 'čajová plantáž Gorreana';infos[80] = 'jezero Furnas';infos[81] = 'vulkanické bahno u jezera Furnas';infos[82] = 'horké prameny u jezera Furnas';infos[83] = 'příprava cozido u jezera Furnas';infos[84] = 'vytahování uvařeného cozido z vulkanické půdy';infos[85] = 'kaldera s městem Furnas';infos[86] = 'jezero Furnas z Pico do Ferro';infos[87] = 'Furnas, pohled z Pico do Ferro';infos[88] = 'Furnas, kostel';infos[89] = 'ohnisko termálních pramenů, Furnas ';infos[90] = '...';infos[91] = '...';infos[92] = 'tady se vaří v pytlích kukuřice';infos[93] = 'každý kohoutek z jiného pramene';infos[94] = 'termální bazén v parku Terra Nostra';infos[95] = 'Furnas, záběry z parku Terra Nostra';infos[96] = '...';infos[97] = 'hortenzie modré...';infos[98] = '...hortenzie fialové';infos[99] = '...a červené lekníny, vše v Terra Nostra';infos[100] = '...';infos[101] = 'denní netopýr v parku Terra Nostra';infos[102] = 'poutní místo Nossa Senhora da Paz';infos[103] = 'schodiště k Nossa Senhora da Paz nad Villafranca do Campo';infos[104] = 'centrální část ostrova São MIguel';infos[105] = 'pozůstatky akvaduktu';infos[106] = 'naše skupina i s průvodcem pod akvaduktem';infos[107] = 'pěnkavák pod akvaduktem';infos[108] = 'hortenzie všude';infos[109] = 'hrana kaldery nad Lagoa de Santiago';infos[110] = 'Lagoa Azul, Sete Cidades';infos[111] = 'Lagoa de Santiago a Lagoa Azul';infos[112] = 'Lagoa Verde a Lagoa Azul';infos[113] = 'Lagoa de Santiago';infos[114] = 'na březích Lagoa Azul';infos[115] = '...';infos[116] = 'umělý kanál k vyrovnávání hladiny jezera';infos[117] = 'Lagoa Rasa';infos[118] = 'kapr v Lagoa Rasa';infos[119] = 'Sete Cidades, kostel';infos[120] = 'původní azorský kostel, Sete Cidades';infos[121] = 'sídlo Mosteiros na jedné z fajas';infos[122] = 'útesy na západním pobřeží São Miguel';infos[123] = '...';infos[124] = 'sesuv odhalil vrstvu sopečného popela';infos[125] = 'ruiny větrného mlýna';infos[126] = '...kde zůstaly mlýnské kameny';infos[127] = 'ananasové skleníky plantáže Arruda';infos[128] = 'skleník s ananasy';infos[129] = 'zosobnění průmyslu a obchodu v plantáži Arruda';infos[130] = 'pohled na město Horta od sochy Panny Marie';infos[131] = 'Horta, pohled z hory Guia';infos[132] = 'pláž Porto Pim a Spálená hora';infos[133] = 'zátoka na odvrácené straně Monte Guia';infos[134] = 'schody na horu Guia nad Hortou';infos[135] = 'skály pod Monte Guia';infos[136] = 'vřesovec, původní azorská rostlina';infos[137] = 'původní azorská cesmína';infos[138] = 'observatoř prince Alberta';infos[139] = 'dům amerického konzula Dabneye';infos[140] = 'Horta, domečky u Porto Pim';infos[141] = 'Horta';infos[142] = 'hospoda "U Petra," založená 1918';infos[143] = 'Horta, věhlasná hospoda "U Petra"';infos[144] = 'zákoutí v hospodě "U Petra"';infos[145] = 'přístav v Hortě a malí námořníci';infos[146] = '...';infos[147] = 'Horta, katamarán v přístavu';infos[148] = 'Horta, stěhování člunu';infos[149] = 'Horta, grafita, vytvořená posádkami jachet';infos[150] = '...';infos[151] = '...';infos[152] = 'Horta, muzeum řezeb z velrybích kostí';infos[153] = '...';infos[154] = 'dvě spojené vorvaní čelisti';infos[155] = 'Panna Marie nad městem Horta, ostrov Faial';infos[156] = 'tunel do svahu kaldery';infos[157] = 'pohled v dešti do kaldery Cabeca Gordo';infos[158] = 'Capelinhos, nový kousek ostrova Faial';infos[159] = 'sopečný popel a písek z roku 1957';infos[160] = 'vrstvy sopečného popela, Capelinhos';infos[161] = 'nová silnice mezi nánosy popela';infos[162] = 'bývalá vesnice, zasypaná erupcí';infos[163] = 'horní polovina majáku';infos[164] = 'mohutná vrstva sopečného popela';infos[165] = 'Capelinhos, sopečné "pole"';infos[166] = 'houževnatá vegetace bojuje s popelem';infos[167] = '...';infos[168] = 'odplouváme z Horty';infos[169] = '...';infos[170] = 'přelétáme nad ostrovem Pico';infos[171] = 'krajina na západním Picu';infos[172] = 'Pico, nejvyšší hora Azor a Portugalska';infos[173] = 'hora Pico při pohledu z ostrova Faial';infos[174] = 'ostrov Pico, hora Pico';infos[175] = 'zbytky bývalého kráteru cestou na Pico';infos[176] = 'Pico, lávový pes';infos[177] = 'cesta pro valení sudů s vínem na čluny';infos[178] = 'Pico, lávový chaos, zvaný misterio';infos[179] = '...';infos[180] = 'moře proniká hluboko do lávy';infos[181] = 'lávový most';infos[182] = 'vyjeté koleje v lávové cestě';infos[183] = 'vstup do přírodního bazénu s mořskou vodou';infos[184] = 'domek z lávových kamenů a studna na brakickou vodu';infos[185] = 'Lagoa do Capitão v mlze';infos[186] = 'původní jalovce u Lagoa do Capitão';infos[187] = 'muzeum velrybářství';infos[188] = 'harpunář před muzeem velrybářství, Pico';infos[189] = 'muzeum velrybářství, Lajes, Pico';infos[190] = 'vorvaní čelisti';infos[191] = 'poustevna sv.Petra z roku 1460';infos[192] = 'Padrão k výročí 500 let osídlení ostrova Pico';infos[193] = 'Lajes, ostrov Pico';infos[194] = 'vinohrady na ostrově Pico';infos[195] = '...';infos[196] = 'vinohrady u moře, naproti Faial';infos[197] = 'větrný mlýn mezi vinohrady, Pico';infos[198] = 'několik pokusů o zachycení vorvaně';infos[199] = '...';infos[200] = '...';infos[201] = 'před sestupem do lávové jeskyně Gruta das Torres';infos[202] = 'pseudokrasové útvary v Gruta das Torres';infos[203] = '...';infos[204] = '...';infos[205] = 'provazcová láva typu pahoehoe na dně jeskyně';infos[206] = 'nízký průchod v jeskyni Gruta das Torres';infos[207] = '...a zpátky na světlo ostrova Pico';infos[208] = 'kaktusy v zahradě domku, Madalena, Pico';infos[209] = 'venkovní část muzea vína s dracaenami';infos[210] = 'další dracaeny';infos[211] = 'kvetoucí dracaena';infos[212] = 'prastará dracaena';infos[213] = 'vinařské lisy v muzeu vína na Picu';infos[214] = 'Velas, největší město na São Jorge';infos[215] = 'Velas, mořská brána';infos[216] = 'ostrov São Jorge, Velas, místní svátek';infos[217] = '...včetně polykačů ohně';infos[218] = 'park Ponta dos Rosais, člun na tvaru ostrova';infos[219] = 'pěnkavák v parku dos Rosais';infos[220] = 'prádelna v Ponta dos Rosais ';infos[221] = 'především cryptomerie - Ponta dos Rosais';infos[222] = 'hortenzie coby živý plot';infos[223] = 'výlev lávy do moře, Faja do Ouvidor';infos[224] = 'nepřístupné břehy ostrova São Jorge';infos[225] = 'strmé útesy ostrova São Jorge';infos[226] = 'Faja dos Cubres pod útesy';infos[227] = 'Faja dos Cubres';infos[228] = 'naše skupina vysoko nad Faja dos Cubres';infos[229] = 'Faja do Ouvidor';infos[230] = 'Faja do Ouvidor - pod útesem';infos[231] = 'kostel sv.Barbory v sídle Manadas';infos[232] = 'ojedinělá barokní výzdoba v kostele sv.Barbory';infos[233] = '...';infos[234] = 'kostel sv.Barbory';infos[235] = 'malovaný strop kostela sv.Barbory';infos[236] = 'pohled na ostrov Pico ze São Jorge';infos[237] = 'sloupcovitá odlučnost ztuhlé lávy, Faja do Ouvidor';infos[238] = 'Urzelina, věž kostela, zasypaného lávou';infos[239] = '...u letiště ve Velas';infos[240] = 'monument na počet Pedra IV.';infos[241] = 'Angra do Heroísmo';infos[242] = 'Angra do Heroísmo, katedrála';infos[243] = 'Angra do Heroísmo, katedrála';infos[244] = 'postříbřený oltář v katedrále Angra do Heroísmo';infos[245] = 'pulpit z tropických dřev v katedrále';infos[246] = 'vyzdobená ulice v Angra do Heroísmo';infos[247] = '...';infos[248] = '...';infos[249] = 'novodobá úprava domu v Angra do Heroísmo';infos[250] = 'Angra do Heroísmo, domy s typickými balkony ';infos[251] = '...';infos[252] = 'strmá ulička v horní části Angra do Heroísmo';infos[253] = 'Angra do Heroísmo, radnice';infos[254] = 'Angra do Heroísmo, palác generálních kapitánů';infos[255] = 'klášter São Gonçalo, mříž, oddělující protor pro jeptišky';infos[256] = 'kostel kláštera São Gonçalo';infos[257] = 'klášter São Gonçalo, opěrka lavice';infos[258] = 'lavice pro jeptišky, klášter São Gonçalo';infos[259] = 'malé varhany v části pro jeptišky';infos[260] = 'malovaný strop v klášteře São Gonçalo';infos[261] = 'prostor pro hovory jeptišek s příbuznými';infos[262] = 'ambity kláštera São Gonçalo';infos[263] = 'zahrady vévodů z Terceiry, Angra do Heroísmo';infos[264] = 'sousoší před býčí arénou';infos[265] = '...a ještě jedno';infos[266] = 'hradby městské pevnosti';infos[267] = 'kostel milosrdenství';infos[268] = 'Angra do Heroísmo, zachmuřený Vasco de Gama';infos[269] = 'další imperio v Angra do Heroísmo';infos[270] = '"imperio" sv.Ducha, Angra do Heroísmo';infos[271] = 'imperio v São Sebastião';infos[272] = 'svatodušní imperio v Praia da Vitória';infos[273] = 'další do "sbírky" imperios, Praia da Vitória';infos[274] = 'svatodušní koruny v nedalekém imperio';infos[275] = 'kaldera hory Monte Brasil';infos[276] = 'socha Afonsa VI.na Monte Brasil';infos[277] = 'britské protiletecké kanony z 2. sv.války na MOnte Brasil';infos[278] = 'Angra do Heroísmo, pohled z Monte Brasil  ';infos[279] = 'São Sebastião, nejstarší kostel na Azorech';infos[280] = 'nástěnná malba v kostele São Sebastião';infos[281] = 'Praia da Vitória, ostrov Terceira';infos[282] = 'socha Neposkvrněného srdce Mariina nad Praia da Vitória';infos[283] = 'porost vřesovce nad kráterem Algar do Carvão   ';infos[284] = 'sestup do kráteru Algar do Carvão   ';infos[285] = 'průhled sopouchem kráteru';infos[286] = 'do hladka obroušené stěny kráteru';infos[287] = 'jezírko na dně Algar do Carvão   ';infos[288] = 'Algar do Carvão   ';infos[289] = 'kouřící fumaroly Furnas do Enxorfe';infos[290] = 'Terceira, cesta v mlze mezi hortenziemi';infos[291] = 'Terceira, moře u Biscoitos';infos[292] = '...';infos[293] = 'čekání na býka v obci Fontinhas';infos[294] = '...';infos[295] = 'čtyři chlapi drží býka na laně';infos[296] = '...a provokování býka';infos[297] = '...';infos[298] = '...';infos[299] = 'bezpečný úkryt před býkem i deštěm';
    var showTitle = false;

  }

}
