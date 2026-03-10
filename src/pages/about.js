import { mountPage, sectionCard, el } from '../ui.js';
import { getLang, t } from '../i18n.js';

export async function renderAbout(app) {
  const exhibitionCopy = {
    en: [
      'Da capo sine fine',
      'Abraham & Wolff',
      '14 March - 9 May, 2026',
      'Da capo is a musical instruction meaning from the beginning. Combined with the phrase sine fine, without end, an eternal musical loop is created. Unless the conductor orders the performers to stop, the piece contains no ultimate resolution within itself - Da capo sine fine.',
      'Scottish psychoanalyst R.D. Laing coined this phrase in his book of dialogue-scenarios Knots (1970), appropriating it from music and transposing it into the relational sphere. In it, he sought to describe the cyclical, self-contained and self-reinforcing semantic knots that exist in human relationships. In this same decade, a moment when the intellectual sphere was grappling with the Grand Narratives of Marxism, psychoanalysis, and structuralism, Roland Barthes wrote his seminal text on love Fragments d’un discours amoureux (1977). Barthes broke love into its smallest linguistic units - speech, gestures, states, suspensions - revealing how amorous feeling is performed, endlessly repeated and deferred.',
      'To Barthes, love is not a feeling but a posture one inhabits, a performative stance, a figure one actively embodies - a Lover at work. To Laing, relationships - whether they be amorous or familial - are encapsulated and performed through linguistic patterns. Read alongside one another, these texts reveal a shared interest in how subjects become trapped inside their own and others’ projections. These semantic loops do not resolve; they fold back on themselves. Meaning does not advance; it returns. The subject does not stand alone but emerges through language, in relation and in repetition. It is this dialectical logic of endless return that structures the exhibition.',
      'The works in the exhibition approach these questions from different points of departure: through the enactment of systems of interdependence, the staging of ritualised codes of desire, or the material traces of encounters - ranging from the violent to the tender. Each, a fragment that negotiates with the unique tensions that are embedded in attachment - the need for closeness always carries with it the potential for danger.',
    ],
    fr: [
      'Da capo sine fine',
      'Abraham & Wolff',
      '14 mars – 9 mai 2026',
      'Da capo est une indication musicale qui veut dire « depuis le début ». Associée à l’expression sine fine, « sans fin », elle crée une boucle musicale éternelle. À moins que le chef d’orchestre n’ordonne aux interprètes de s’arrêter, la pièce ne contient aucune résolution ultime en elle-même - Da capo sine fine.',
      'Le psychanalyste écossais R. D. Laing a repris cette expression dans son livre de scénarios dialogués Knots (1970), l’empruntant au domaine musical pour la transposer dans la sphère relationnelle. Il y décrit les nœuds sémantiques cycliques, autosuffisants et auto-renforçants qui traversent les relations humaines. Au cours de cette même décennie, alors que la sphère intellectuelle était aux prises avec les grands récits du marxisme, de la psychanalyse et du structuralisme, Roland Barthes publia son texte fondateur sur l’amour, Fragments d’un discours amoureux (1977). Barthes y décompose l’amour en ses plus petites unités linguistiques - paroles, gestes, états, suspensions - révélant comment le sentiment amoureux se performe, se répète et se diffère indéfiniment.',
      'Pour Barthes, l’amour n’est pas un sentiment mais une posture que l’on habite - un·e amoureux·se au travail. Pour Laing, les relations - qu’elles soient amoureuses ou familiales - s’expriment et se rejouent à travers des structures linguistiques. Lus côte à côte, ces textes révèlent un intérêt commun pour la manière dont les sujets se trouvent pris dans leurs propres projections et celles des autres. Ces boucles sémantiques ne se résolvent pas ; elles se replient sur elles-mêmes. Le sens n’avance pas ; il revient. Le sujet ne se tient pas seul, mais émerge à travers le langage, dans la relation et dans la répétition. C’est cette logique dialectique du retour sans fin qui structure l’exposition.',
      'Les œuvres réunies dans l’exposition abordent ces questions à partir de différents points de départ : par la mise en œuvre de systèmes d’interdépendance, la mise en scène de codes ritualisés du désir, ou les traces matérielles de rencontres - allant de la violence à la tendresse. Chacune constitue un fragment qui négocie avec les tensions propres à l’attachement : le besoin de proximité porte toujours en lui la possibilité du danger.',
    ],
  };

  const curatorBlock = ({ name, imgSrc, alt, imgClass }) =>
    el('div', { class: 'curator' }, [
      el('img', {
        class: imgClass ? `curator-img ${imgClass}` : 'curator-img',
        src: imgSrc,
        alt,
        loading: 'lazy',
      }),
      el('div', { class: 'curator-meta' }, [
        el('div', { class: 'curator-name' }, [name]),
        el('div', { class: 'curator-text' }, ['']),
      ]),
    ]);

  const curators = [
    curatorBlock({
      name: 'Julia Tavares',
      imgSrc: './Images/artists/julia-tavares-curator.jpg',
      alt: 'Julia Tavares',
      imgClass: 'curator-img--julia',
    }),
    curatorBlock({
      name: 'Amalia Mytilineou',
      imgSrc: './Images/artists/amalia-mytilineou-curator.jpeg',
      alt: 'Amalia Mytilineou',
      imgClass: 'curator-img--amalia',
    }),
  ];
  if (Math.random() < 0.5) curators.reverse();

  const exhibitionText = el('div', { class: 'exhibition-text' });
  const renderExhibitionText = () => {
    exhibitionText.innerHTML = '';
    const lang = getLang();
    const paras = exhibitionCopy[lang] || exhibitionCopy.en;
    for (const p of paras) exhibitionText.appendChild(el('p', {}, [p]));
  };
  renderExhibitionText();
  window.addEventListener('i18n:change', renderExhibitionText);

  mountPage(
    app,
    {
      navActive: 'about',
      bodyClass: 'page-about',
      showCredit: false,
    },
    [
      el('div', { class: 'about-grid' }, [
        el('div', { class: 'about-col about-col--exhibition' }, [
          sectionCard(t('nav.exhibition_text'), [exhibitionText]),
        ]),
        el('div', { class: 'about-col about-col--curators' }, [
          sectionCard(t('about.curators_title'), [
            el('div', { class: 'curators' }, [
              ...curators,
            ]),
          ]),
        ]),
      ]),
    ]
  );
}
