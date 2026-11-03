---
name: rea-changelog-update
description: "Préparez ou réécrivez les changelogs de release REA et les notes de release GitHub à partir d'un historique Git figé, avec des remerciements aux contributeurs vérifiés et une synchronisation avec Release Please."
---

# Mise à jour du changelog REA

Utilisez ce skill dans un clone du dépôt REA (`morluto/rea`) ; les guides cités sont embarqués sous `references/rea/` (copie figée du commit importé ; dans un clone, la version du clone fait foi).

Utilisez-le pour préparer les notes de release et attribuer les contributions. Lisez [docs/releasing.md](references/rea/docs/releasing.md) depuis la racine du dépôt pour connaître l'autorité de publication et les vérifications de checkpoint existantes. Ce skill prépare les notes ; il n'autorise ni fusion, ni tag, ni publication.

## Inventoriez avant de rédiger

Récupérez l'historique complet et les tags. Sélectionnez le tag de référence publié dans `.release-please-manifest.json` sur la **branche de base** de la PR de release, et figez le SHA exact de cette branche comme cible éditoriale. Les tags REA sont de la forme `rea-agents-VERSION`. Utilisez la version proposée, suffixe de pré-release compris ; ne modifiez pas la stratégie `always-bump-minor` pour imiter les versions calendaires d'OpenClaw.

```bash
node scripts/release-notes.mjs inventory \
  --repository morluto/rea --base rea-agents-PREVIOUS \
  --target FULL_BASE_BRANCH_SHA --version VERSION \
  --manifest /tmp/rea-VERSION.contributions.json
node scripts/release-notes.mjs record \
  --manifest /tmp/rea-VERSION.contributions.json \
  --summary \
  --output /tmp/rea-VERSION.record.md
```

Lisez l'inventaire, pas seulement le brouillon existant du bot. Il inclut les commits des branches annexes, les PR associées par GitHub dont les commits de fusion sont dans l'intervalle, les auteurs et co-auteurs des commits, ainsi que les issues de fermeture confirmées avec leurs rapporteurs. Les connexions GitHub sont paginées. Les erreurs réseau interrompent la génération ; après rétablissement, relancez vers un nouveau fichier de sortie. Les fichiers de sortie existants ne sont jamais écrasés.

Les identités de commit non résolues sont conservées sous forme de noms/e-mails avec `user: null` ; ne devinez jamais un handle et ne remerciez pas la personne qui a fusionné à la place. Le rapport préserve les inconnues. Il s'agit d'un instantané de métadonnées revu, pas d'une preuve indépendante qu'un humain a écrit un patch. Pour les identités non attribuées, les stratégies de fusion inhabituelles, les backports, les reverts ou les références que GitHub n'a pas associées, examinez les PR sources et leurs diffs et signalez la limite. Le collecteur actuel s'appuie sur les relations de fermeture de PR confirmées pour créditer les rapporteurs d'issues ; les simples mentions d'issues sans lien ne sont pas créditées automatiquement. N'affirmez pas qu'un travail simplement inventorié est encore livré après un revert.

## Écrivez pour les utilisateurs et conservez les crédits

Réécrivez uniquement la section `## [VERSION]` la plus récente de `CHANGELOG.md`, en préservant son titre version/date/lien. Utilisez des éléments de liste Markdown sur une seule ligne sous :

- `### Highlights` : quelques résultats utilisateur qui définissent la release ; pas de quota pour les petites releases.
- `### Changes` : capacités et changements de comportement significatifs.
- `### Fixes` : correctifs de fiabilité, d'exactitude, de compatibilité et de sécurité.
- `### ⚠ BREAKING CHANGES` : à conserver le cas échéant, avec les migrations et les références de PR/commit d'origine exigées par le validateur de checkpoint existant.

Regroupez les travaux liés par workflow d'analyste ou par impact utilisateur. Expliquez le comportement obtenu en entrées courtes et concrètes. Les Highlights résument la release ; évitez de répéter leurs descriptions complètes dans Changes. Le nettoyage interne, les tests, la CI et la documentation courante ont généralement leur place uniquement dans le fichier de provenance. Lisez les PR et diffs ambigus avant d'affirmer quoi que ce soit. Distinguez les vérifications sur provider simulé de la vérification sur provider réel.

Créditez chaque contribution représentée une seule fois dans les notes publiques, avec son lien et `Thanks @...` pour son auteur humain vérifié, ses co-auteurs connus et les rapporteurs des issues de fermeture confirmées. Le regroupement préserve tous ces crédits sur une seule ligne. Lorsque des Highlights, des entrées détaillées ou des migrations font référence au même travail, placez ses remerciements dans une seule de ces entrées, pas dans toutes. Incluez les liens d'issues. Les puces de commits directs portent le lien du commit et le crédit humain connu. Excluez les bots GitHub et les comptes d'agents connus. Les trailers de co-auteur Anthropic, Cursor, Codex et Copilot observés dans REA se résolvent en `@claude`, `@cursoragent`, `@codex` et `@Copilot`, de type GitHub `User` ; la politique de crédit les exclut tout en conservant leurs métadonnées. À la demande du mainteneur de REA, omettez les auto-remerciements de `@morluto` tout en préservant la paternité dans l'inventaire. Les autres contributeurs humains restent éligibles. Utilisez des liens GitHub explicites pour les références inter-dépôts afin d'éviter les numéros `#NNN` ambigus. Les handles inconnus restent inconnus ; ils ne deviennent pas des crédits fabriqués.

Ajoutez tel quel le lien de provenance généré par `record --summary` à la fin de cette release. L'inventaire lié rend compte de chaque PR et contribution directe découverte dans l'intervalle, y compris le travail interne omis de la prose. Ne collez pas la sortie complète de `record` dans les notes publiques : elle duplique les remerciements et masque les changements visibles par les utilisateurs. Les registres complets restent disponibles pour la revue. Ne modifiez pas à la main les crédits générés pour faire passer la validation. Rafraîchissez l'inventaire lorsque l'historique du produit change ; une correction de prose seule peut réutiliser l'instantané.

## Finalisez avec Release Please

Avant de modifier la PR de release en ligne, obtenez l'autorisation pour cette mise à jour de PR. La préparation et la validation locales peuvent avancer indépendamment.

1. Ajoutez `rea:release-notes-finalized` à la PR de release ouverte sélectionnée **avant** de modifier sa branche ou son corps. Les pushs de proposition sur main respectent ce label. C'est le garde-fou de notre workflow, pas le mécanisme `autorelease: snooze` de Release Please. Une proposition déjà en cours doit se terminer avant toute modification. Ne déclenchez pas de préparation manuelle par-dessus des notes finalisées.
2. Sur cette branche de release, enregistrez l'inventaire revu sous `docs/releases/VERSION.contributions.json`. Il s'agit d'une provenance de release publique et durable, pas d'un fichier de planification temporaire. N'y ajoutez ni identifiants ni dumps de l'environnement local. Gardez les artefacts de version existants alignés.
3. Exécutez le validateur de checkpoint existant et le nouveau checker :

   ```bash
   node scripts/release-notes.mjs check \
     --manifest docs/releases/VERSION.contributions.json
   node scripts/release-notes.mjs render \
     --manifest docs/releases/VERSION.contributions.json \
     --output /tmp/rea-VERSION.notes.md
   ```

   Le checker prend en charge les corps de PR inline, métadonnées environnantes comprises, jusqu'à la limite GitHub de 65 536 caractères. Il échoue sur des notes plus longues plutôt que de tronquer les crédits ; les corps à lien de débordement de Release Please ne sont pas intégrés.

4. Mettez à jour le corps de la PR de release avec la section rendue, en préservant l'en-tête et le pied de page de Release Please ainsi que sa structure composant/version. Passez par un fichier de corps avec `gh pr edit --body-file` ; modifier uniquement `CHANGELOG.md` ne change pas le corps de release de Release Please. Ne poussez que les changements autorisés.
5. Récupérez à nouveau le corps de la PR dans un fichier et exécutez `check --pr-body FILE`. Revoyez le diff complet et attendez la CI à jour. La publication revérifie le corps avant la création de la release. Évitez toute autre modification du corps pendant la publication.

Le label de finalisation gèle les rafraîchissements du bot, pas main. Tout nouveau changement produit postérieur à la cible de l'inventaire impose de rafraîchir les notes avant publication. Le workflow vérifie l'ascendance de la cible et n'autorise que les chemins de métadonnées de release après cette cible. Il exige aussi que la cible de l'inventaire soit égale au premier parent de la fusion revue : des commits intermédiaires sur main imposent donc un nouvel inventaire. Revoyez aussi les diffs dans les chemins de métadonnées de release autorisés : le garde-fou sur les chemins ne prouve pas que des modifications de dépendances ou de scripts de package se limitent à la version. Pour reprendre les propositions automatiques, retirez le label de finalisation et laissez le bot régénérer ; attendez-vous à ce que les modifications éditoriales soient remplacées.

Les releases existantes sans inventaire de contributions conservent leur chemin de publication actuel. Ne retaguez ni ne republiez jamais un package pour corriger la prose d'une release.
