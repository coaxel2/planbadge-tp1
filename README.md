# Planbadge — TP1 : Publier sa première application sur Internet

Déploiement complet **from scratch** sur un VPS Debian 13, par **Axel Courty** — de la page perso à une application full-stack conteneurisée, le tout en HTTPS derrière Nginx.

## 🔗 En ligne

| Service | URL |
|---|---|
| 🪪 Portfolio | https://axel.planbadge.fr |
| ✍️ Application « Livre d'or » | https://axel.planbadge.fr/livredor/ |
| ⛏️ CraftMatch (projet fun) | https://axel.planbadge.fr/craftmatch/ |
| 🤖 n8n (automatisation) | https://axel-n8n.51.75.251.56.sslip.io/ |

## 📂 Contenu du dépôt

```
.
├── site/                 # Portfolio personnel (HTML/CSS statique)
│   └── index.html
├── livredor/             # Application full-stack "Livre d'or"
│   ├── server.js         #   API REST + persistance (Node.js pur, zéro dépendance)
│   ├── public/index.html #   Frontend
│   └── Dockerfile        #   Conteneurisation
├── craftmatch/           # Mini-site fun (site de rencontre Minecraft, front-end)
│   └── index.html
├── n8n/                  # Workflow n8n d'exemple
│   └── n8n-workflow.json #   (Manuel → poste un message sur le Livre d'or)
└── deploy/               # Configurations Nginx réelles (référence)
    ├── axel.conf         #   vhost axel.planbadge.fr (HTTPS + reverse-proxy /livredor/)
    └── n8n-axel.conf     #   vhost n8n (HTTPS)
```

## 🏗️ Architecture — la chaîne de mise en production

```
Nom de domaine → DNS → Adresse IP → Serveur → Nginx → Application
```

- **Serveur** : VPS Debian 13 — 4 vCPU / 7,6 Go RAM / 74 Go SSD.
- **Nginx** : reverse-proxy + terminaison TLS, un vhost par service.
- **HTTPS** : certificats Let's Encrypt (Certbot), renouvellement automatique, redirection HTTP→HTTPS.
- **Docker** : le Livre d'or et n8n tournent en conteneurs isolés, liés à `127.0.0.1` (joignables uniquement via Nginx).
- **Sécurité SSH** : authentification par clé uniquement (`PasswordAuthentication no`).

## ✍️ L'application « Livre d'or »

Démontre le cycle complet **frontend → API → persistance → déploiement** :

- Backend en **Node.js pur** (module `http`), **sans aucune dépendance** → image Docker minimale.
- API REST : `GET /api/messages`, `POST /api/messages`.
- Persistance sur volume Docker (`/data/messages.json`).
- Protection XSS côté client (rendu via `textContent`) + validation côté serveur.

### Lancer en local

```bash
cd livredor
docker build -t livredor .
docker run -d --name livredor -p 127.0.0.1:3000:3000 -v livredor_data:/data livredor
# http://localhost:3000
```

## 🤖 n8n

Déployé via Docker, servi en HTTPS sur son propre sous-domaine (path racine — le
sous-chemin `/n8n/` étant déconseillé par n8n). Le sous-domaine est fourni par
[sslip.io](https://sslip.io) (résolution DNS automatique vers l'IP), faute de
contrôle sur la zone DNS. Le workflow `n8n/n8n-workflow.json` poste un message
sur le Livre d'or — un exemple concret de n8n qui pilote l'app maison.

## 🔐 Sécurité

- HTTPS partout (Let's Encrypt) avec redirection automatique.
- SSH par clé uniquement, mot de passe désactivé.
- Conteneurs exposés seulement en local, jamais directement sur Internet.
- Aucun secret dans le dépôt.

---

*Réalisé dans le cadre du TP1 — mise en production de A à Z.*  ·  Licence [MIT](LICENSE).
