# Planbadge — TP1 : Publier sa première application sur Internet

Déploiement complet réalisé sur un VPS Debian 13, par **Axel Courty**.

🌐 **Page perso :** https://axel.planbadge.fr
✍️ **Application « Livre d'or » :** https://axel.planbadge.fr/livredor/
🤖 **n8n (automatisation) :** https://axel-n8n.51.75.251.56.sslip.io/

## Ce que contient ce dépôt

```
.
├── site/                 # Page personnelle (HTML/CSS statique, servie par Nginx)
│   └── index.html
├── livredor/             # Application full-stack "Livre d'or"
│   ├── server.js         #   API REST + persistance (Node.js pur, zéro dépendance)
│   ├── public/index.html #   Frontend
│   └── Dockerfile        #   Conteneurisation
└── deploy/               # Configurations Nginx (référence)
    ├── axel.conf         #   vhost axel.planbadge.fr (HTTPS + reverse-proxy /livredor/)
    └── n8n-axel.conf     #   vhost n8n (sous-domaine sslip.io, HTTPS)
```

## Architecture (la chaîne de mise en production)

```
Nom de domaine → DNS → Adresse IP → Serveur → Nginx → Application
```

- **Serveur** : VPS Debian 13, 4 vCPU / 7,6 Go RAM / 74 Go SSD.
- **Nginx** : reverse-proxy + terminaison TLS, un vhost par service.
- **HTTPS** : certificats Let's Encrypt (Certbot), renouvellement automatique, redirection HTTP→HTTPS.
- **Sécurité SSH** : authentification par clé uniquement (`PasswordAuthentication no`).

## L'application « Livre d'or »

Petite application full-stack démontrant le cycle complet **frontend → API → persistance → déploiement** :

- Backend en **Node.js pur** (module `http`), sans aucune dépendance → image Docker minimale.
- API REST : `GET /api/messages`, `POST /api/messages`.
- Persistance sur volume Docker (`/data/messages.json`).
- Conteneur lié à `127.0.0.1` : joignable uniquement via Nginx en HTTPS.

### Lancer en local

```bash
cd livredor
docker build -t livredor .
docker run -d --name livredor -p 127.0.0.1:3000:3000 -v "$PWD/data:/data" livredor
# http://localhost:3000
```

## n8n

Déployé via Docker, servi en HTTPS sur son propre sous-domaine (path racine — la
configuration en sous-chemin `/n8n/` étant déconseillée par n8n). Le sous-domaine
est fourni par [sslip.io](https://sslip.io) (résolution DNS automatique vers l'IP),
faute de contrôle sur la zone DNS du serveur de classe.

---

*Réalisé dans le cadre du TP1 — mise en production from scratch.*
