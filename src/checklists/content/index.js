// Реестр готовых чек-листов: slug → содержимое.
// Новый чек-лист: файл в этой папке + строка здесь + checklists/<slug>/index.html.
// Реестр нужен только пре-рендеру; в браузере детальная страница грузит один файл, разводящая — data.js.
import forma from './forma.js'
import modalnayaForma from './modalnaya-forma.js'
import podpiska from './podpiska.js'
import kviz from './kviz.js'
import hero from './hero.js'
import heroSlajder from './hero-slajder.js'
import akkordeonFaq from './akkordeon-faq.js'
import preimushchestva from './preimushchestva.js'
import otzyvy from './otzyvy.js'
import tekst from './tekst.js'
import tekstIzobrazhenie from './tekst-izobrazhenie.js'
import video from './video.js'
import komanda from './komanda.js'
import logotipy from './logotipy.js'
import dostizheniya from './dostizheniya.js'
import portfolio from './portfolio.js'
import tarify from './tarify.js'
import anonsy from './anonsy.js'
import karta from './karta.js'
import kontakty from './kontakty.js'
import header from './header.js'
import footer from './footer.js'
import megaMenyu from './mega-menyu.js'
import poisk from './poisk.js'
import hlebnyeKroshki from './hlebnye-kroshki.js'
import paginaciya from './paginaciya.js'
import filtrStatej from './filtr-statej.js'
import vyborGoroda from './vybor-goroda.js'
import avtorizaciya from './avtorizaciya.js'
import registraciya from './registraciya.js'
import profil from './profil.js'
import katalog from './katalog.js'
import filtrTovarov from './filtr-tovarov.js'
import sortirovka from './sortirovka.js'
import kategorii from './kategorii.js'
import podborki from './podborki.js'
import galereyaTovara from './galereya-tovara.js'
import cena from './cena.js'
import harakteristiki from './harakteristiki.js'
import vKorzinu from './v-korzinu.js'
import izbrannoe from './izbrannoe.js'
import korzina from './korzina.js'
import oformlenieZakaza from './oformlenie-zakaza.js'
import kupitV1Klik from './kupit-v-1-klik.js'
import oplata from './oplata.js'
import cookie from './cookie.js'
import page404 from './404.js'
import preloader from './preloader.js'
import tehraboty from './tehraboty.js'
import splash from './splash.js'
import restApi from './rest-api.js'
import adaptivnost from './adaptivnost.js'
import krossbrauzernost from './krossbrauzernost.js'
import dostupnost from './dostupnost.js'

export const CONTENT = {
  forma,
  'modalnaya-forma': modalnayaForma,
  podpiska,
  kviz,
  hero,
  'hero-slajder': heroSlajder,
  'akkordeon-faq': akkordeonFaq,
  preimushchestva,
  otzyvy,
  tekst,
  'tekst-izobrazhenie': tekstIzobrazhenie,
  video,
  komanda,
  logotipy,
  dostizheniya,
  portfolio,
  tarify,
  anonsy,
  karta,
  kontakty,
  header,
  footer,
  'mega-menyu': megaMenyu,
  poisk,
  'hlebnye-kroshki': hlebnyeKroshki,
  paginaciya,
  'filtr-statej': filtrStatej,
  'vybor-goroda': vyborGoroda,
  avtorizaciya,
  registraciya,
  profil,
  katalog,
  'filtr-tovarov': filtrTovarov,
  sortirovka,
  kategorii,
  podborki,
  'galereya-tovara': galereyaTovara,
  cena,
  harakteristiki,
  'v-korzinu': vKorzinu,
  izbrannoe,
  korzina,
  'oformlenie-zakaza': oformlenieZakaza,
  'kupit-v-1-klik': kupitV1Klik,
  oplata,
  cookie,
  '404': page404,
  preloader,
  tehraboty,
  splash,
  'rest-api': restApi,
  adaptivnost,
  krossbrauzernost,
  dostupnost,
}

export { countChecks } from '../count.js'
