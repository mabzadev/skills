---
name: rea-tool-design
description: "Auditez, étudiez, concevez ou modifiez les outils d'investigation REA, les contrats CLI/MCP, les capacités des providers et la sémantique de l'Evidence."
---

# Conception des outils REA

Utilisez ce skill dans un clone du dépôt REA (`morluto/rea`) ; les guides cités sont embarqués sous `references/rea/` (copie figée du commit importé ; dans un clone, la version du clone fait foi).

Appuyez-vous sur le [guide de conception des outils](references/rea/docs/tool-design.md) pour les frontières des outils, la sémantique des contrats, la propriété des providers et la découvrabilité. Inspectez le contrat actuel et l'outil existant le plus proche de la question de l'analyste ; le code source, la documentation et les catalogues live peuvent décrire des versions différentes.

Pour un travail adossé à un provider, exercez la tâche de l'analyste à travers REA et comparez les observations pertinentes du provider natif et d'artefacts indépendants lorsqu'elles sont disponibles. Vérifiez les résultats partiels applicables, la reprise et les frontières de session ; signalez ce qui n'a pas été exercé. Pour guider face aux échecs, suivez [concevoir la reprise autour de l'échec](references/rea/docs/tool-design.md#design-recovery-around-the-failure). Servez-vous de la [vérification des workflows](references/rea/docs/testing.md#provider-backed-workflow-verification) pour choisir les preuves à l'appui du contrat proposé, au lieu de rechercher la parité avec l'API du provider.

Pour un audit, suivez [auditer les outils existants](references/rea/docs/tool-design.md#audit-existing-tools) : délimitez des tâches représentatives, exercez le workflow live et distinguez les bugs reproduits, les limitations étayées, les opportunités de conception et les affirmations non vérifiées. Rapportez les alternatives qui fonctionnent et les limites des preuves en plus des constats.

Pour une demande de conception, renvoyez la frontière proposée, la forme des entrées et des résultats, la sémantique de l'Evidence, l'alternative la plus proche et l'approche de vérification. Implémentez lorsque c'est demandé, en respectant le périmètre de l'utilisateur et l'autorisation existante.

Pour l'implémentation ou la vérification, consultez [testing](references/rea/docs/testing.md) pour les voies de consommateurs et de providers affectées, et [contributing](references/rea/CONTRIBUTING.md) pour la propriété des fichiers générés. Ne lisez les guides de providers et de workflows qu'en fonction des besoins de la tâche.
