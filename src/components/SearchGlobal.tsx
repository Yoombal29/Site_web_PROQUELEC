
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "page" | "blog" | "document" | "event";
  url: string;
}

export function SearchGlobal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Données simulées pour la recherche
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Normes électriques 2024",
      content: "Découvrez les nouvelles normes électriques en vigueur...",
      type: "blog",
      url: "/blog/normes-electriques-2024"
    },
    {
      id: "2",
      title: "À propos de PROQUELEC",
      content: "PROQUELEC est votre partenaire de confiance...",
      type: "page",
      url: "/about"
    },
    {
      id: "3",
      title: "Guide d'installation",
      content: "Manuel complet pour les installations électriques...",
      type: "document",
      url: "/documents/guide-installation"
    }
  ];

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulation d'une recherche
    setTimeout(() => {
      const filtered = mockResults.filter(
        item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blog": return "bg-blue-100 text-blue-800";
      case "page": return "bg-green-100 text-green-800";
      case "document": return "bg-purple-100 text-purple-800";
      case "event": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="pl-8"
        />
      </div>

      {(results.length > 0 || isSearching) && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-2">
            {isSearching ? (
              <div className="p-2 text-sm text-muted-foreground">Recherche...</div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => window.location.href = result.url}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{result.title}</h4>
                      <Badge className={getTypeColor(result.type)}>
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {result.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                Aucun résultat trouvé
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
