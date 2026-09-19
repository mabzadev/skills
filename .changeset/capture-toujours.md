---
"skills": patch
---

Rendez la capture indépendante du harnais : le sous-bloc `### Journal d’amélioration` écrit par `setup-mabza-skills` devient une instruction impérative aux agents (capturer immédiatement sous `.agents/feedback/`, ne jamais corriger en silence), valable aussi hors Codex où l’invocation implicite n’existe pas. `/improve-mabza`, face à un journal vide, demande désormais si la conversation en cours contient des retours à capturer avant de s’arrêter.
