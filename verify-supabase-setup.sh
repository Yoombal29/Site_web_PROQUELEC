#!/bin/bash

# 🔍 Script de Vérification - Supabase Client Setup
# Utilisation: bash verify-supabase-setup.sh

echo "🔍 Vérification de la Configuration Supabase..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
PASS=0
FAIL=0

# Fonction pour vérifier
check() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌ $2${NC}"
        FAIL=$((FAIL + 1))
    fi
}

# Vérification 1: Singleton exists
echo "📁 Vérifiant les fichiers..."
[ -f "src/utils/supabaseClient.ts" ]
check $? "Singleton client exists (src/utils/supabaseClient.ts)"

# Vérification 2: AdminPagesManagerAdvanced uses singleton
grep -q "getSupabaseClient" src/components/admin/AdminPagesManagerAdvanced.tsx
check $? "AdminPagesManagerAdvanced utilise getSupabaseClient()"

# Vérification 3: AdminContentManager uses singleton
grep -q "getSupabaseClient" src/components/admin/AdminContentManager.tsx
check $? "AdminContentManager utilise getSupabaseClient()"

# Vérification 4: Pas de createClient dans admin files
! grep -q "createClient" src/components/admin/AdminPagesManagerAdvanced.tsx
check $? "Pas de createClient() direct dans AdminPagesManagerAdvanced"

! grep -q "createClient" src/components/admin/AdminContentManager.tsx
check $? "Pas de createClient() direct dans AdminContentManager"

echo ""
echo "📊 Vérification du Logging..."

# Vérification 5: Logging en place
grep -q "console.log.*📝" src/components/admin/AdminPagesManagerAdvanced.tsx
check $? "Logging détaillé présent dans AdminPagesManagerAdvanced"

grep -q "console.error.*❌" src/components/admin/AdminPagesManagerAdvanced.tsx
check $? "Logging d'erreur présent dans AdminPagesManagerAdvanced"

echo ""
echo "🏗️ Vérification du Build..."

# Vérification 6: Build succeeds
npm run build > /dev/null 2>&1
check $? "npm run build completes successfully"

# Vérification 7: No TypeScript errors
npm run build 2>&1 | grep -q "error"
[ $? -ne 0 ]
check $? "Pas d'erreurs TypeScript"

echo ""
echo "════════════════════════════════════"
echo "📋 Résumé"
echo "════════════════════════════════════"
echo -e "Total Vérifications: $TOTAL"
echo -e "${GREEN}Réussi: $PASS${NC}"
echo -e "${RED}Échoué: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ Toutes les vérifications réussies!${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. npm run dev"
    echo "2. Ouvrir http://localhost:5173"
    echo "3. Tester la création/modification de pages dans Admin"
    echo "4. Vérifier la console pour les logs détaillés"
    exit 0
else
    echo -e "${RED}❌ Certaines vérifications ont échoué${NC}"
    echo ""
    echo "Problèmes possibles:"
    echo "- Fichiers manquants"
    echo "- Modifications non appliquées"
    echo "- Erreurs de build"
    exit 1
fi
