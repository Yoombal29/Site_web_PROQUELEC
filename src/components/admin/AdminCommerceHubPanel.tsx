import { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Package, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import AdminAssetsPanel from '@/components/admin/AdminAssetsPanel';
import AdminPaymentPanel from '@/components/admin/AdminPaymentPanel';
import { EcommerceAdminPanel } from '@/components/admin/EcommerceAdminPanel';
import { useAssets } from '@/hooks/useAssets';
import { useEcommerceStore } from '@/stores/ecommerce.store';

export default function AdminCommerceHubPanel() {
  const { data: assets = [], isLoading, refetch } = useAssets();
  const products = useEcommerceStore((s) => s.products);
  const paymentGateway = useEcommerceStore((s) => s.paymentGateway);
  const paymentProvider = useEcommerceStore((s) => s.paymentProvider);
  const syncDocumentCatalog = useEcommerceStore((s) => s.syncDocumentCatalog);

  useEffect(() => {
    if (!isLoading) {
      syncDocumentCatalog(assets);
    }
  }, [assets, isLoading, syncDocumentCatalog]);

  const monetizedAssets = useMemo(
    () => assets.filter((asset) => asset.monetization_active && asset.file_url),
    [assets],
  );

  const documentProducts = useMemo(
    () => products.filter((product) => product.source === 'document'),
    [products],
  );

  const manualProducts = useMemo(
    () => products.filter((product) => product.source !== 'document'),
    [products],
  );

  const latestUpdate = useMemo(() => {
    const timestamps = assets
      .map((asset) => asset.updated_at || asset.created_at)
      .filter(Boolean)
      .map((value) => new Date(value as string).getTime())
      .filter((value) => Number.isFinite(value));

    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps)).toLocaleString('fr-FR');
  }, [assets]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{assets.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              Monétisables
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{monetizedAssets.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-violet-600" />
              Boutique sync
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{documentProducts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-lg font-bold capitalize">{paymentGateway}</div>
            <Badge variant="secondary" className="capitalize">
              {paymentProvider}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Commerce centralisé</CardTitle>
            <p className="text-sm text-muted-foreground">
              Les documents monétisés alimentent le catalogue e-commerce. Les paiements restent
              alignés sur la configuration serveur.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {latestUpdate && (
              <Badge variant="outline" className="hidden md:inline-flex">
                Mis à jour {latestUpdate}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList className="flex w-full flex-wrap justify-start gap-2">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payments">Paiements</TabsTrigger>
              <TabsTrigger value="shop">Boutique</TabsTrigger>
              <TabsTrigger value="stats">Synthèse</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <AdminAssetsPanel />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <AdminPaymentPanel />
            </TabsContent>

            <TabsContent value="shop" className="space-y-4">
              <EcommerceAdminPanel />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Catalogue manuel</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">{manualProducts.length}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Produits documents</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {documentProducts.length}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Actifs monétisés</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {monetizedAssets.length}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
