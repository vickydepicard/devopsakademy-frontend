# DevOpsAkademy – Frontend - Vicky

Frontend de la plateforme **DevOpsAkademy**, construit avec **Vite + Node.js 20** et déployé automatiquement via un pipeline **CI/CD GitHub Actions** vers un serveur **Apache2**.

---

## 🚀 Objectifs du projet

- Mettre en place un **pipeline CI/CD de bout en bout**
- Garantir un déploiement **automatisé, déterministe et reproductible**
- Appliquer des **bonnes pratiques DevOps réelles**
- Séparer clairement :
  - le **build**
  - le **runtime**
  - le **serveur web**

---

## 🧱 Stack technique

- **Frontend** : Vite, JavaScript
- **Qualité code** : ESLint
- **CI/CD** : GitHub Actions
- **Déploiement** : SSH + script serveur
- **Serveur web** : Apache2
- **OS serveur** : Ubuntu Linux

---

## 🌿 Branching strategy

- `develop` : branche de développement actif  
- Chaque push sur `develop` déclenche automatiquement le pipeline de déploiement

---

## 🔁 Pipeline CI/CD – Vue d’ensemble

### Déclencheur
- Push sur la branche `develop`

### Étapes du pipeline
1. Connexion SSH au serveur
2. Exécution du script de déploiement serveur
3. Synchronisation du code avec `origin/develop`
4. Build du frontend
5. Déploiement du build dans Apache
6. Reload d’Apache

👉 **Le serveur reflète toujours exactement l’état de la branche `develop`.**

---

## ⚙️ Script de déploiement serveur

Le déploiement est centralisé dans un script exécuté sur le serveur :

