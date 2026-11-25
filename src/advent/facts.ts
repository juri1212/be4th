// What is behind the doors: one useless but true piece of knowledge per day. Where the sources call a story a legend
// or rely on a single witness, the text says so.

export type Topic = 'Geschichte' | 'Sport' | 'Geschichte und Sport';

export interface Source {
  name: string;
  url: string;
}

export interface Fact {
  topic: Topic;
  title: string;
  text: string;
  // What its drawing shows.
  drawing: string;
  sources: Source[];
}

// In order of the doors, so FACTS[0] is behind door 1.
export const FACTS: Fact[] = [
  {
    topic: 'Geschichte',
    title: 'Emus 1, Armee 0',
    text: '1932 zog das australische Militär mit zwei Maschinengewehren und 10.000 Schuss in den Krieg gegen Emus, die Felder verwüsteten. Die Vögel teilten sich in kleine Trupps auf und rannten einfach weg. Nach gut einem Monat gab die Armee auf. Die Emus haben bis heute keine Friedensverhandlungen aufgenommen.',
    drawing: 'Ein Soldat schwenkt eine weiße Fahne, während drei Emus vergnügt davonlaufen.',
    sources: [{ name: 'Wikipedia: Emu War', url: 'https://en.wikipedia.org/wiki/Emu_War' }],
  },
  {
    topic: 'Sport',
    title: 'Der langsamste Marathon der Welt',
    text: 'Shizō Kanakuri brach den Olympia-Marathon 1912 in Stockholm ab und fuhr heim nach Japan, ohne sich abzumelden. 1967 holte ihn das schwedische Fernsehen zurück, damit er ins Ziel laufen konnte. Offizielle Zeit: 54 Jahre, 8 Monate, 6 Tage, 5 Stunden, 32 Minuten und 20,3 Sekunden.',
    drawing: 'Ein alter Mann mit langem weißem Bart läuft durchs Zielband. Eine Schnecke ist schneller.',
    sources: [
      { name: 'Guinness World Records', url: 'https://www.guinnessworldrecords.com/news/2019/8/longest-marathon-in-history-the-athlete-that-took-more-than-half-a-century' },
      { name: 'Wikipedia: Shizo Kanakuri', url: 'https://en.wikipedia.org/wiki/Shizo_Kanakuri' },
    ],
  },
  {
    topic: 'Geschichte',
    title: 'Der Staat riecht mit',
    text: 'Friedrich der Große ließ Kaffee nur noch in staatlichen Röstereien rösten. Damit sich alle daran hielten, stellte er rund 400 Kriegsversehrte als Kaffeeschnüffler ein. Ihr Beruf: durch die Straßen gehen und riechen, ob irgendwo heimlich geröstet wird.',
    drawing: 'Ein Mann in Uniform schnuppert mit riesiger Nase am Kaffeeduft, der aus einem Fenster zieht.',
    sources: [{ name: 'Wikipedia: Kaffeeriecher', url: 'https://de.wikipedia.org/wiki/Kaffeeriecher' }],
  },
  {
    topic: 'Sport',
    title: 'Tour de Bahn',
    text: 'Bei der Tour de France 1904 wurden die ersten vier der Gesamtwertung disqualifiziert, dazu alle Etappensieger. Der Vorwurf lautete unter anderem: Sie hätten Auto und Eisenbahn benutzt. So gewann nachträglich der Fünfte, Henri Cornet. Mit 19 Jahren ist er bis heute der jüngste Toursieger.',
    drawing: 'Zwei Radfahrer winken aus dem Zug, ihre Räder stehen auf dem Dach. Daneben strampelt ein dritter auf der Straße.',
    sources: [{ name: 'Wikipedia: 1904 Tour de France', url: 'https://en.wikipedia.org/wiki/1904_Tour_de_France' }],
  },
  {
    topic: 'Geschichte',
    title: 'Unter Wert entführt',
    text: 'Als Piraten den jungen Julius Caesar entführten und 20 Talente Lösegeld verlangten, lachte er sie laut Plutarch aus: Er sei mindestens 50 wert. Während der 38 Tage Gefangenschaft las er ihnen eigene Gedichte vor und beschimpfte sie als Barbaren, wenn sie nicht begeistert genug waren.',
    drawing: 'Caesar liest auf dem Piratenschiff ein Gedicht vor. Ein Pirat hält sich die Ohren zu, der andere schläft ein.',
    sources: [{ name: 'Plutarch, Caesar 1–2', url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html' }],
  },
  {
    topic: 'Sport',
    title: 'Ärger wegen der Stiefel',
    text: 'Tauziehen war von 1900 bis 1920 olympisch. 1908 verloren die USA gegen die Polizei von Liverpool und protestierten: Deren Dienststiefel hätten verbotene Stahlkanten. Der Protest wurde abgelehnt, die Amerikaner zogen beleidigt ab. Im Finale unterlag Liverpool dann der Polizei der City of London.',
    drawing: 'Beim Tauziehen lachen zwei Polizisten in riesigen Stiefeln, ihre Gegner schwitzen.',
    sources: [
      { name: 'Wikipedia: Tug of war 1908', url: 'https://en.wikipedia.org/wiki/Tug_of_war_at_the_1908_Summer_Olympics' },
      { name: 'Mental Floss', url: 'https://www.mentalfloss.com/sports/olympics/tug-war-used-be-olympic-sport' },
    ],
  },
  {
    topic: 'Geschichte',
    title: 'Ein Elch auf Abwegen',
    text: 'Der Astronom Tycho Brahe hatte eine Nase aus Messing und einen zahmen Elch. Seinem Biografen Gassendi zufolge war der Elch bei einem Adligen in Landskrona zu Gast, trank beim Abendessen zu viel Bier, stürzte die Treppe hinunter und starb.',
    drawing: 'Ein Elch mit Serviette sitzt schwindelig am Tisch, vor ihm ein Krug Bier. Ein Mann mit goldener Nase staunt.',
    sources: [{ name: 'Wikipedia: Tycho Brahe', url: 'https://en.wikipedia.org/wiki/Tycho_Brahe' }],
  },
  {
    topic: 'Sport',
    title: 'Bei 47:47 war Schluss',
    text: 'Das längste Tennismatch der Geschichte spielten John Isner und Nicolas Mahut 2010 in Wimbledon: 11 Stunden und 5 Minuten, verteilt auf drei Tage, 70:68 im fünften Satz. Die Anzeigetafel gab vorher auf. Sie war nur bis 47:47 programmiert.',
    drawing: 'Zwei erschöpfte Tennisspieler vor einer qualmenden Anzeigetafel, auf der 47:47 steht.',
    sources: [{ name: 'Wikipedia: Isner–Mahut match', url: 'https://en.wikipedia.org/wiki/Isner%E2%80%93Mahut_match_at_the_2010_Wimbledon_Championships' }],
  },
  {
    topic: 'Geschichte',
    title: 'Geld stinkt nicht',
    text: 'Kaiser Vespasian besteuerte den Urin aus Roms öffentlichen Latrinen, denn Wäscher und Gerber brauchten ihn zum Reinigen. Als sein Sohn Titus sich ekelte, hielt er ihm laut Sueton eine Münze unter die Nase und fragte, ob sie rieche. In Frankreich heißen Pissoirs bis heute Vespasiennes.',
    drawing: 'Ein Kaiser hält eine Münze hoch, sein Sohn hält sich neben einem stinkenden Topf die Nase zu.',
    sources: [{ name: 'Wikipedia: Pecunia non olet', url: 'https://en.wikipedia.org/wiki/Pecunia_non_olet' }],
  },
  {
    topic: 'Sport',
    title: 'Meilenweit, oder auch nicht',
    text: 'Alan Shepard nahm 1971 den Kopf eines Sechsereisens mit auf den Mond, steckte ihn auf ein Werkzeug für Bodenproben und schlug einhändig zwei Golfbälle. Der zweite fliege „meilenweit“, funkte er. 50 Jahre später wertete jemand die Fotos aus: Es waren knapp 37 Meter.',
    drawing: 'Ein Astronaut spielt auf dem Mond Golf, die Erde schaut lächelnd zu.',
    sources: [{ name: 'Space.com', url: 'https://www.space.com/apollo-14-moon-landing-golf-shot-analysis' }],
  },
  {
    topic: 'Geschichte',
    title: 'Tanzen bis der Arzt kommt',
    text: '1518 tanzten in Straßburg Hunderte Menschen tagelang, ohne aufhören zu können. Die Ärzte diagnostizierten erhitztes Blut, und der Stadtrat verordnete als Kur: noch mehr tanzen. Er ließ eine Bühne bauen und engagierte Musiker. Es wurde nicht besser.',
    drawing: 'Drei Menschen tanzen wild auf einer Bühne, ein Musiker spielt Geige dazu.',
    sources: [{ name: 'The Public Domain Review', url: 'https://publicdomainreview.org/essay/the-dancing-plague-of-1518/' }],
  },
  {
    topic: 'Sport',
    title: 'Halbzeit mit Ballwechsel',
    text: 'Vor dem ersten WM-Finale 1930 konnten sich Argentinien und Uruguay nicht auf einen Ball einigen. Also spielten sie jede Halbzeit mit einem anderen. Mit dem argentinischen Ball führte Argentinien 2:1, mit dem uruguayischen gewann Uruguay am Ende 4:2.',
    drawing: 'Zwei Fußballer streiten sich, jeder mit seinem eigenen Ball. Der Schiedsrichter weiß nicht weiter.',
    sources: [{ name: 'Wikipedia: 1930 FIFA World Cup final', url: 'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_final' }],
  },
  {
    topic: 'Geschichte',
    title: 'Herr von Hohenfall',
    text: 'Beim Prager Fenstersturz 1618 flogen drei Männer rund 17 Meter tief aus der Burg und überlebten alle. Der mitgestürzte Sekretär Philipp Fabricius wurde später geadelt, als „von Hohenfall“. Im selben Jahr begann Bocholt, sich ein Rathaus mit auffallend vielen Fenstern zu bauen.',
    drawing: 'Männer segeln an ihren Umhängen aus einem Burgfenster. Einer ist schon gelandet und trägt eine Krone.',
    sources: [
      { name: 'Wikipedia: Zweiter Prager Fenstersturz', url: 'https://de.wikipedia.org/wiki/Zweiter_Prager_Fenstersturz' },
      { name: 'Wikipedia: Philipp Fabricius', url: 'https://de.wikipedia.org/wiki/Philipp_Fabricius' },
      { name: 'Stadt Bocholt', url: 'https://www.bocholt.de/stadtportait.pdf' },
    ],
  },
  {
    topic: 'Sport',
    title: 'Gold für den Veranstalter',
    text: 'Von 1912 bis 1948 gab es olympische Medaillen für Architektur, Literatur, Musik, Malerei und Bildhauerei. Das erste Literatur-Gold ging an eine „Ode an den Sport“ von Georges Hohrod und M. Eschbach. Dahinter steckte Pierre de Coubertin, der Gründer der modernen Spiele.',
    drawing: 'Auf dem Siegertreppchen stehen ein Maler, ein Geiger und ganz oben ein Dichter mit Goldmedaille.',
    sources: [
      { name: 'Olympedia', url: 'https://www.olympedia.org/results/920001' },
      { name: 'Wikipedia: Art competitions', url: 'https://en.wikipedia.org/wiki/Art_competitions_at_the_Summer_Olympics' },
    ],
  },
  {
    topic: 'Geschichte',
    title: 'Einer mehr als vorher',
    text: 'Liechtensteins letzter Militäreinsatz war 1866: 80 Mann bewachten das Stilfser Joch und trafen auf keinen Feind. Zurück kamen der Überlieferung nach 81, denn unterwegs hatte sich jemand angeschlossen. Zwei Jahre später schaffte das Land seine Armee ab.',
    drawing: 'Drei Soldaten wandern durch die Berge und nehmen einen neuen Freund an der Hand mit.',
    sources: [
      { name: 'Wikipedia: Military history of Liechtenstein', url: 'https://en.wikipedia.org/wiki/Military_history_of_Liechtenstein' },
      { name: 'We Are The Mighty', url: 'https://www.wearethemighty.com/mighty-history/liechtenstein-army-81-men-returned/' },
    ],
  },
  {
    topic: 'Sport',
    title: 'Letzter, dann Erster',
    text: 'Im Shorttrack-Finale 2002 lag Steven Bradbury hoffnungslos hinten. Das war sein Plan: abwarten, ob die anderen stürzen. In der letzten Kurve stürzten alle vier. Er glitt vorbei und holte das erste Wintergold für Australien. Im Halbfinale war er genauso weitergekommen.',
    drawing: 'Vier Eisschnellläufer sind übereinandergepurzelt, der fünfte gleitet jubelnd ins Ziel.',
    sources: [{ name: 'Wikipedia: Steven Bradbury', url: 'https://en.wikipedia.org/wiki/Steven_Bradbury' }],
  },
  {
    topic: 'Geschichte',
    title: 'Verteidiger der Ratten',
    text: 'Im 16. Jahrhundert mussten sich in Autun der Überlieferung nach Ratten vor Gericht verantworten, weil sie die Gerste gefressen hatten. Ihr Anwalt Barthélemy de Chasseneuz entschuldigte ihr Fehlen: Der Weg zum Gericht sei wegen der vielen Katzen unzumutbar.',
    drawing: 'Drei Ratten verstecken sich in ihrem Loch, davor warten zwei Katzen. Ihr Anwalt erklärt es dem Richter.',
    sources: [
      { name: 'Discover Magazine', url: 'https://www.discovermagazine.com/yes-animals-and-insects-have-stood-trial-in-court-44543' },
      { name: 'Wikipedia: Barthélemy de Chasseneuz', url: 'https://en.wikipedia.org/wiki/Barth%C3%A9lemy_de_Chasseneuz' },
    ],
  },
  {
    topic: 'Sport',
    title: 'Mit dem Auto zum Marathon',
    text: 'Beim Olympia-Marathon 1904 in St. Louis fuhr der Erste im Ziel, Fred Lorz, einen Teil der Strecke im Auto. Gold bekam Thomas Hicks, der unterwegs mit Strychnin, Eiweiß und Brandy versorgt worden war. Der Kubaner Félix Carvajal machte ein Nickerchen und wurde Vierter.',
    drawing: 'Ein Läufer winkt aus einem Auto, ein anderer schläft unter einem Apfelbaum.',
    sources: [{ name: 'Wikipedia: Marathon 1904', url: 'https://en.wikipedia.org/wiki/Athletics_at_the_1904_Summer_Olympics_%E2%80%93_Men%27s_marathon' }],
  },
  {
    topic: 'Geschichte',
    title: 'Napoleons Hasenpanik',
    text: '1807 wollte Napoleon Kaninchen jagen. Sein Stabschef Berthier hatte allerdings zahme besorgt, und die hielten den Kaiser für die Fütterung. Laut General Thiébault, der Berthier nicht leiden konnte, stürmten Hunderte auf ihn zu, bis er in die Kutsche flüchtete.',
    drawing: 'Napoleon rennt vor vielen Kaninchen zu seiner Kutsche.',
    sources: [
      { name: 'Mental Floss', url: 'https://www.mentalfloss.com/history/military/time-napoleon-was-attacked-rabbits' },
      { name: 'Just History Posts', url: 'https://justhistoryposts.com/2023/01/27/a-brief-moment-of-history-when-napoleon-took-on-rabbits/' },
    ],
  },
  {
    topic: 'Sport',
    title: 'Weltmeister der Spürnasen',
    text: 'Vier Monate vor der WM 1966 wurde der Pokal in London gestohlen, ausgerechnet auf einer Briefmarkenausstellung. Die Polizei suchte vergeblich. Eine Woche später fand ihn der Hund Pickles beim Gassigehen, eingewickelt in Zeitungspapier. Er bekam Futter für ein Jahr.',
    drawing: 'Ein Hund sitzt stolz neben einem goldenen Pokal, der in Zeitungspapier steckt.',
    sources: [{ name: 'Wikipedia: Pickles (dog)', url: 'https://en.wikipedia.org/wiki/Pickles_(dog)' }],
  },
  {
    topic: 'Geschichte',
    title: 'Fahrverbot nach sechs Monaten',
    text: 'Am 12. Juni 1817 fuhr Karl Drais in Mannheim zum ersten Mal mit seiner Laufmaschine, dem Urahn des Fahrrads. Weil die Straßen voller Furchen waren, wichen die Fahrer auf den Gehweg aus. Schon im Dezember 1817 verbot Mannheim das. Der Streit dauert bis heute an.',
    drawing: 'Ein Mann fährt auf einem Laufrad über den Gehweg. Eine Frau springt zur Seite, ein Polizist hält ein Verbotsschild hoch.',
    sources: [{ name: 'Stadt Mannheim', url: 'https://www.mannheim.de/sites/default/files/page/220/drais_flyer_web.pdf' }],
  },
  {
    topic: 'Sport',
    title: 'Korb mit Boden',
    text: 'Beim ersten Basketballspiel der Welt, am 21. Dezember 1891, hingen echte Pfirsichkörbe an der Wand, und zwar mit Boden. Nach einem Treffer musste der Hausmeister mit der Leiter kommen und den Ball herausholen. Er kam genau einmal: Das Spiel endete 1:0.',
    drawing: 'Der Hausmeister holt auf der Leiter einen Ball aus einem Pfirsichkorb, drei Spieler schauen zu.',
    sources: [
      { name: 'Today I Found Out', url: 'https://www.todayifoundout.com/index.php/2012/01/the-origin-of-basketball/' },
      { name: 'Wikipedia: History of basketball', url: 'https://en.wikipedia.org/wiki/History_of_basketball' },
    ],
  },
  {
    topic: 'Geschichte',
    title: 'Korporal Bär',
    text: 'Damit der Braunbär Wojtek im Zweiten Weltkrieg mit an die Front durfte, machte ihn die polnische Armee zum Soldaten, mit Dienstgrad, Nummer und Soldbuch. Bei Monte Cassino schleppte er Munitionskisten und wurde zum Korporal befördert. Er soll Bier gemocht und Zigaretten gegessen haben.',
    drawing: 'Ein Bär mit Soldatenmütze trägt eine Holzkiste, ein Soldat grüßt ihn.',
    sources: [{ name: 'Wikipedia: Wojtek (bear)', url: 'https://en.wikipedia.org/wiki/Wojtek_(bear)' }],
  },
  {
    topic: 'Geschichte und Sport',
    title: 'Das Weihnachtsspiel',
    text: 'Weihnachten 1914 legten an der Westfront viele Soldaten die Waffen nieder, sangen und tauschten Geschenke. Der sächsische Leutnant Johannes Niemann erzählte später von einem Fußballspiel gegen Schotten im Niemandsland: 3:2 für die Deutschen. Am lautesten gelacht wurde, als der Wind verriet, was die Schotten unter dem Kilt trugen. Nichts.',
    drawing: 'Ein deutscher Soldat und ein Schotte im Kilt spielen im Schnee Fußball, zwischen ihnen leuchtet ein Weihnachtsbaum.',
    sources: [{ name: 'Mike Dash History', url: 'https://mikedashhistory.com/2011/12/24/the-christmas-truce/' }],
  },
];
