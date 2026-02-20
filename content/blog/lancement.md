---
title: 'Lancement du blog'
description: 'Lancement du blog et unification des thèmes'
pubDate: 'Jan 10 2026'
tags: ['blog', 'infra', 'devops']
---

Il était une fois un adminsys qui avait une furieuse envie de partager ses connaissances, notamment sur docker et home assistant. Après plusieurs semaines de recherches, il déploya un mk-docs, puis [mk-docs-materials](https://squidfunk.github.io/mkdocs-material/) sur github. Premier CI/CD, premier déploiement ... Une expérience précieuse, en plus du partage des acquis. La première version se nommait *become.sh*.

Puis il a eu envie de se faire un portfolio. Pas qu'il ait des trucs à montrer en particulier, juste une envie d'avoir un truc un peu plus stylé que des CV à la pelle. On est en 2026, plutôt spécialistes en informatique alors pourquoi continuer le format papier que, de toute façon, personne ne lit ?

Ainsi est né le site https://adenyrr.me, dans une première version sous [Hugo](https://gohugo.io/), et un thème trouvé sur github. Le site était sympa, mais sans plus. Beaucoup d'options étaient sous-exploitées et au final, ça ne m'a pas vraiment convaincu. 
L'ajout de ce site, en plus de la documentation, m'a contraint à déménager sur Gitlab avec des Pages en illimité même en version *Free Plan*, là où Github limite à une page par ... Utilisateur.

Quitte à déménager, j'ai également abandonné mk-docs-materials, devenu désuet, pour le remplacer par [Zensical](https://zensical.org/), de la même équipe. Grosso-modo, la même chose en mieux. Disponible à l'adresse https://docu.adenyrr.me, c'est toujours hébérgé chez Gitlab, garantissant une disponibilité optimale. Ce fut également mes premiers pas avec le format TOML, requis pour la configuration de [Zensical](https://zensical.org).

Enfin, [Youkyi](https://github.com/YouKyi) m'a présenté un diagramme de son infra, fait sous Figma. J'était bluffé, donc j'ai fait pareil. Moyennement convaincu, j'ai d'abord up le résultat sur gitlab, et j'ai commencé à le retravailler ... En vibe coding. ALORS. Gros morceau que le vibe coding, et ça fera probablement l'objet d'un article dédié. Toujours est-il que le site est disponible à l'adresse https://infra.adenyrr.me, et que finalement, ça risque de devenir une application indépendante. Enfin, on verra.

Au final, je déploie mon blog, avec ce premier article. Un design unifié, une navigation que j'espère agréable. J'ai beaucoup appris : les CI/CD, pipelines gitlab, gestion de secrets dans les repos, déploiement de [Hugo](https://gohugo.io/), de [Zensical](https://zensical.org/), de [Gatsby](https://www.gatsbyjs.com/docs/) ... L'utilisation d'agents LLM différents pour sortir un truc pas trop immonde de mes dix saucisses. J'avoue, je me suis bien marré.

Allez, des bisous o/
