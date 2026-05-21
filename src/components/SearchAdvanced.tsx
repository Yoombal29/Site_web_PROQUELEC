
import { useState } from "react";
import { Search, Filter, X, FileText, Calendar, Book, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";

const typeIcons = {
  page: FileText,
  blog: Book,
  document: File,
  event: Calendar
};

const typeLabels = {
  page: 'Page',
  blog: 'Article',
  document: 'Document',
  event: 'Événement'
};

const typeColors = {
  page: 'bg-green-100 text-green-800',
  blog: 'bg-blue-100 text-blue-800',
  document: 'bg-purple-100 text-purple-800',
  event: 'bg-orange-100 text-orange-800'
};

export function SearchAdvanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    hasResults,
    totalResults
  } = useGlobalSearch();

  const debouncedQuery = useDebounce(query, 300);

  const handleTypeToggle = (type: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      types: checked ?
      [...prev.types, type] :
      prev.types.filter((t) => t !== type)
    }));
  };

  const ResultItem = ({ result }: {result: SearchResult;}) => {
    const Icon = typeIcons[result.type];

    return (
      <div
        className="p-4 hover:bg-accent rounded-md cursor-pointer border-l-4 border-l-proqblue/20 hover:border-l-proqblue transition-all"
        onClick={() => {
          window.location.href = result.url;
          setIsOpen(false);
        }}>
        
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-proqblue" />
            <h4 className="font-medium text-proqblue line-clamp-1">{result.title}</h4>
          </div>
          <Badge className={typeColors[result.type]}>
            {typeLabels[result.type]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {result.excerpt}
        </p>
        {result.category &&
        <p className="text-xs text-proqblue/60">Catégorie: {result.category}</p>
        }
        {result.date &&
        <p className="text-xs text-muted-foreground">
            {new Date(result.date).toLocaleDateString('fr-FR')}
          </p>
        }
      </div>);

  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher sur le site..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-12"
          aria-label="Recherche globale" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          aria-label="Filtres de recherche">
          
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtres */}
      {showFilters &&
      <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Filtrer par type</h3>
            <div className="space-y-2">
              {Object.entries(typeLabels).map(([type, label]) =>
            <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                id={type}
                checked={filters.types.includes(type)}
                onCheckedChange={(checked) => handleTypeToggle(type, !!checked)} />
              
                  <label htmlFor={type} className="text-sm">
                    {label}
                  </label>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }

      {/* Résultats */}
      {isOpen && query.length >= 2 &&
      <Card className="absolute top-full mt-1 w-full z-40 shadow-lg max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Recherche...' : `${totalResults} résultat${totalResults > 1 ? 's' : ''}`}
              </span>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0">
              
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ?
            <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) =>
              <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
              )}
                </div> :
            hasResults ?
            <div className="py-2">
                  {results.map((result) =>
              <ResultItem key={`${result.type}-${result.id}`} result={result} />
              )}
                </div> :

            <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun résultat trouvé</p>
                  <p className="text-sm">Essayez avec d'autres mots-clés</p>
                </div>
            }
            </div>
          </CardContent>
        </Card>
      }

      {/* Overlay pour fermer */}
      {isOpen &&
      <div
        className="fixed inset-0 z-30"
        onClick={() => setIsOpen(false)}
        aria-hidden="true" />

      }
    </div>);

}