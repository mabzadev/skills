---
"skills": minor
---

Ajoutez la boucle d'auto-amélioration : le skill `note-mabza` (invocable par le modèle) évalue en cours de discussion si une idée émergente est une fonctionnalité à implémenter, un concept à conserver, un ajustement de skill ou une piste écartée, puis laisse une entrée structurée dans le journal `.agents/feedback/`. Le skill `/improve-mabza` intègre récursivement les entrées ouvertes — plan confirmé, cascade complète des index et de la documentation, trace des décisions. `setup-mabza-skills` propose désormais d'activer le journal (section D).

Ajoutez l'oracle du dépôt `scripts/validate-skills.mjs` (`npm run validate`) : il définit « le dépôt est correct » — invariants du journal, arborescence des skills, cohérence des index, pages de documentation, synchro des versions — avec un mode ciblé (`--feedback`, `--skill <nom>`) et sort une erreur par ligne. La cascade de `/improve-mabza` l'exécute en boucle bornée jusqu'à exit 0, et le workflow CI le rejoue à chaque push comme seconde barrière indépendante.

Ajoutez les tests sous `tests/` selon la convention superboard : `checks/` (vérifications par propriétaire), `lints/` (règles partagées entre l'oracle et les tests), `fixtures/` (données partagées) et `e2e/` (parcours complet de la boucle en bac à sable). `npm test` (`node --test`) et la CI les exécutent.

Réorganise `scripts/` selon la convention superboard : `README.md` de conventions (bash -n, exécution depuis la racine, idempotence), `build.sh` (assemble `./dist` après pré-vol), `prepare-dist.sh` (oracle + tests + versions, exécuté par la CI) et `dev.sh` (environnement local : liens, oracle, tests).
