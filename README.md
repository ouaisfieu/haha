# Observatoire Arizona, édition rire jaune — le gouvernement De Wever sous cinq angles

Site statique sur la coalition fédérale belge « Arizona » (N-VA, MR, Les Engagés, Vooruit, CD&V),
état au **30 septembre 2026**. Il reprend l'Observatoire (dépôt *bisous*), qui réunit trois versions antérieures, et y ajoute une cinquième entrée d'humour noir sourcé :

- **opus** (« l'état des lieux », descriptif) ;
- **greco** v2 (« le contre-rapport », critique, avec outils interactifs) ;
- la **version Gemini** (opus/gemini), dont les idées ont été reprises après vérification et correction.

Site : <https://ouaisfieu.github.io/haha/>

## Cinq entrées, une règle

| Entrée | Statut | Pages |
|---|---|---|
| **Comprendre** | Descriptif | `etat-des-lieux.html` (accueil de l'entrée), `actualite`, `analyse`, `budget`, `fiscalite`, `emploi`, `pensions`, `sante`, `migration`, `defense`, `energie`, `justice`, `institutions`, `contestation`, `opinion`, `acteurs`, `suivi` (30 mesures) |
| **Critiquer** | Thèse assumée | `contre-rapport.html` (accueil), `requisitoire`, `promesses` (14 verdicts), `qui-paie`, `contre-budget`, `priorites`, `democratie`, `coalition`, `angles-morts`, `defense-du-gouvernement` |
| **Calculer** | Règles publiées | `et-moi.html` (26 fiches par situation + calculateurs index, pension, plus-values), `arbitrage.html` (boucler le budget : 13 pistes chiffrées) |
| **Décrypter** | Grille d'analyse | `discours.html` (11 formules), `medias.html` (concentration, 4 cadrages, effets de retour, audit des sources) |
| **Rire jaune** | Satire sourcée | `rire-jaune.html` (chiffres qui font rire jaune, bêtisier de citations authentiques), `dictionnaire.html` (28 définitions cyniques sourcées), `jeux.html` (bingo du 13 octobre, générateur de langue de bois, calculette de l'absurde) ; un « mot jaune » au hasard dans chaque pied de page |
| Référence | Commun | `chronologie`, `glossaire`, `sources` (180), `methodologie`, `recherche`, `data/*.json` |

Règle commune : chaque fait est sourcé (appels `[n]` vers `sources.html`), chaque jugement est signalé.
La page `methodologie.html` détaille ce qui a été repris, corrigé et écarté de la version Gemini.

Chaque entrée a sa couleur (bleu, rouge, vert, violet, jaune), en thème clair comme sombre.

## L'humour noir, mode d'emploi

Aucune citation inventée : les propos cités sont authentiques et sourcés ; les mots-clés du bingo et les
fragments du générateur ne sont attribués à personne. On rit des décisions, des discours et des chiffres,
jamais des personnes qui les subissent. Chaque comparaison affiche son calcul et ses sources.

## Technique

HTML/CSS/JS sans framework, sans dépendance, sans traceur, **sans étape de build**. Fonctionne sur
GitHub Pages (chemins relatifs) et en ouvrant simplement `index.html`. Les données des graphiques et
l'index de recherche existent en `.json` et en copie `.js` (`data/`) pour le mode hors serveur.
Les outils (`assets/js/simu.js`) calculent tout dans le navigateur : rien n'est enregistré ni transmis.

## Publier sur GitHub Pages

```bash
# à la racine du dépôt ouaisfieu/haha, après avoir copié le contenu de ce dossier
git add .
git commit -m "Observatoire Arizona, édition rire jaune — état au 30 septembre 2026"
git push origin main
```
Puis **Settings → Pages → Deploy from a branch → main / (root)**. `.nojekyll` sert les fichiers tels quels.

## Transparence

Rédigé avec l'assistance de Claude (Anthropic) à partir de sources publiques citées ; l'entrée Décrypter
reprend, après vérification, des idées d'une version produite avec Gemini (Google). Erreurs possibles :
vérifier les sources primaires ; signaler via les *issues*.

## Licence

Textes et données : CC BY-NC-SA 4.0 · Code : MIT (voir `LICENSE`).
