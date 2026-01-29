# Infrastructure Souveraine PROQUELEC

Ce dossier contient toute la configuration pour faire tourner la plateforme PROQUELEC en **100% Open Source** sur Docker.

## Structure isolation
- **Port 5433** : Base de données locale (PostgreSQL)
- **Port 8180** : GED Alfresco
- **Port 3101** : BI Metabase
- **Port 8183** : SSO Keycloak

## Procédure de Migration (Supabase -> Local)

### 1. Exporter les données de Supabase
Exécutez cette commande dans votre terminal PowerShell pour extraire l'intégralité de la base actuelle :

```powershell
docker run --rm postgres:15-alpine pg_dump "postgresql://postgres:Darousalam2828Touba@db.yyuhwuaqsbhwtiotyauu.supabase.co:5432/postgres" > docker/postgres/init/supabase_backup.sql
```

### 2. Lancer l'infrastructure
Une fois le fichier `supabase_backup.sql` généré, lancez les conteneurs :

```powershell
cd docker
docker-compose up -d
```

La base de données sera automatiquement initialisée avec vos données Supabase au premier lancement.

## Accès
- **Site Web** : [http://localhost:3100](http://localhost:3100) (Après configuration du frontend)
- **GED Alfresco** : [http://localhost:8180/share](http://localhost:8180/share)
- **BI Metabase** : [http://localhost:3101](http://localhost:3101)
- **SSO Keycloak** : [http://localhost:8183](http://localhost:8183)
