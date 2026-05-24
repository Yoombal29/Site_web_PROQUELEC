# Infrastructure Souveraine PROQUELEC

Ce dossier contient toute la configuration pour faire tourner la plateforme PROQUELEC en **100% Open Source** sur Docker.

## Structure isolation
- **Port 5437** : Base de données locale (PostgreSQL)
- **Port 3101** : BI Metabase
- **Port 3102** : Gateway Nginx

## Maintenance et Sauvegarde

### 1. Sauvegarde des données locales
Exécutez cette commande pour extraire l'intégralité de la base locale :

```powershell
docker exec proquelec-db pg_dump -U postgres postgres > backup_proquelec.sql
```

### 2. Lancer l'infrastructure
Lancement des conteneurs :

```powershell
cd docker
docker-compose up -d
```

L'infrastructure est totalement autonome et hébergée localement.

## Accès
- **Site Web** : [http://localhost:3102](http://localhost:3102) via la gateway ou [http://localhost:5175](http://localhost:5175) en mode développement
- **BI Metabase** : [http://localhost:3101](http://localhost:3101)
