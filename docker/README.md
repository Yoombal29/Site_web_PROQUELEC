# Infrastructure Souveraine PROQUELEC

Ce dossier contient toute la configuration pour faire tourner la plateforme PROQUELEC en **100% Open Source** sur Docker.

## Structure isolation
- **Port 5433** : Base de données locale (PostgreSQL)
- **Port 3101** : BI Metabase

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
- **Site Web** : [http://localhost:3100](http://localhost:3100) (Après configuration du frontend)
- **BI Metabase** : [http://localhost:3101](http://localhost:3101)
