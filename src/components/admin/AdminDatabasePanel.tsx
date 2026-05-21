
import React, { useState, useEffect } from "react";
import { Database, Table, Search, RefreshCw, AlertCircle, Terminal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableData {
  columns: ColumnInfo[];
  rows: unknown[];
}

export const AdminDatabasePanel: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<unknown[] | null>(null);
  const [queryStatus, setQueryStatus] = useState<{rowCount: number;command: string;} | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTables();
  }, []);

  const runSqlQuery = async () => {
    if (!sqlQuery.trim()) {
      toast.error("La requête SQL ne peut pas être vide.");
      return;
    }

    setIsLoading(true);
    setQueryResult(null);
    setQueryStatus(null);

    try {
      const res = await fetch("/api/admin/db/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query: sqlQuery })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response:", text);
        throw new Error("Le serveur a renvoyé une réponse invalide (HTML au lieu de JSON).");
      }

      if (!res.ok) throw new Error(data.error || data.message || "Erreur lors de l'exécution SQL");

      if (data.multiple) {
        // Multi-results: use the first one that has rows or just show status
        const firstWithRows = data.results.find((r: unknown) => r.rows && r.rows.length > 0);
        if (firstWithRows) {
          setQueryResult(firstWithRows.rows);
        } else {
          setQueryStatus({ rowCount: data.results[data.results.length - 1].rowCount, command: "MULTIPLE" });
        }
        toast.success(`${data.results.length} instructions exécutées.`);
      } else if (data.rows && data.rows.length > 0) {
        setQueryResult(data.rows);
        toast.success(`${data.rowCount} lignes récupérées avec succès.`);
      } else {
        setQueryStatus({ rowCount: data.rowCount, command: data.command });
        toast.success(`Action ${data.command} réussie (${data.rowCount} lignes affectées).`);
      }
      fetchTables(); // Refresh list
    } catch (err: unknown) {
      toast.error(`Erreur SQL : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/admin/db/tables", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la récupération des tables");
      const data = await res.json();
      setTables(data);
    } catch (err: unknown) {
      toast.error(err.message);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setIsLoading(true);
    setSelectedTable(tableName);
    try {
      const res = await fetch(`/api/admin/db/tables/${tableName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur lors de la récupération des données");
      const data = await res.json();
      setTableData(data);
    } catch (err: unknown) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTables = tables.filter((t) =>
  t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden">
            {/* Sidebar - Tables List */}
            <div className="w-64 bg-card border border-border rounded-2xl flex flex-col p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-proqblue">
                    <Database className="h-5 w-5" />
                    <h2 className="font-bold text-foreground">Tables SQL</h2>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
            placeholder="Rechercher une table..."
            className="pl-9 h-9 text-sm rounded-xl bg-background border-border text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} />
          
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-1">
                        {filteredTables.map((table) =>
            <button
              key={table}
              onClick={() => fetchTableData(table)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2",
                selectedTable === table ?
                "bg-proqblue text-white shadow-md shadow-proqblue/20" :
                "hover:bg-accent text-muted-foreground hover:text-foreground"
              )} aria-label="Action">
              
                                <Table className="h-4 w-4 opacity-70" />
                                <span className="truncate">{table}</span>
                            </button>
            )}
                    </div>
                </ScrollArea>

                <Button
          variant="ghost"
          size="sm"
          className="mt-4 gap-2 text-gray-500 hover:text-proqblue rounded-xl"
          onClick={fetchTables}>
          
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </Button>
            </div>

            {/* Main Content - Table Explorer */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-sm relative">
                <div className="flex-1 flex flex-col overflow-hidden">
                    {!selectedTable ?
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card">
                            <div className="p-6 rounded-full bg-accent mb-4">
                                <Database className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">PROQUELEC SQL Explorer</h3>
                            <p className="max-w-md text-sm">
                                Sélectionnez une table à gauche pour visualiser ses données ou utilisez le terminal SQL ci-dessous pour des requêtes personnalisées.
                            </p>
                        </div> :

          <>
                            <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-proqblue/10 text-proqblue">
                                            <Table className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground uppercase">
                                            public.{selectedTable}
                                        </h2>
                                    </div>
                                    {tableData &&
                <span className="text-xs text-proqblue font-medium ml-12 mt-1">
                                            {tableData.rows.length} lignes chargées · Schéma actif
                                        </span>
                }
                                </div>

                                <div className="flex gap-2">
                                    <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2"
                  onClick={() => selectedTable && fetchTableData(selectedTable)}>
                  
                                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                        Rafraîchir
                                    </Button>
                                    <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-gray-400"
                  onClick={() => setSelectedTable(null)}>
                  
                                        Fermer
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-6 bg-muted/30 min-h-full">
                                    {isLoading ?
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                                            <RefreshCw className="h-8 w-8 text-proqblue animate-spin" />
                                            <span className="text-sm font-medium text-gray-500">Chargement des données...</span>
                                        </div> :
                tableData ?
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-muted/50 border-b border-border">
                                                            {tableData.columns.map((col) =>
                          <th
                            key={col.column_name}
                            className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                            
                                                                    <div className="flex flex-col">
                                                                        <span>{col.column_name}</span>
                                                                        <span className="text-[10px] text-proqblue font-mono font-medium opacity-60">
                                                                            {col.data_type}
                                                                        </span>
                                                                    </div>
                                                                </th>
                          )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tableData.rows.length === 0 ?
                        <tr>
                                                                <td
                            colSpan={tableData.columns.length}
                            className="px-4 py-8 text-center text-gray-400 italic bg-white">
                            
                                                                    Table vide
                                                                </td>
                                                            </tr> :

                        tableData.rows.map((row, idx) =>
                        <tr
                          key={idx}
                          className="border-b border-border hover:bg-proqblue/5 transition-colors bg-card last:border-0">
                          
                                                                    {tableData.columns.map((col) =>
                          <td
                            key={col.column_name}
                            className="px-4 py-3 text-muted-foreground font-mono">
                            
                                                                            <div className="max-w-[300px] truncate overflow-ellipsis" title={String(row[col.column_name])}>
                                                                                {row[col.column_name] === null ?
                              "null" :
                              typeof row[col.column_name] === "object" ?
                              JSON.stringify(row[col.column_name]) :
                              String(row[col.column_name])}
                                                                            </div>
                                                                        </td>
                          )}
                                                                </tr>
                        )
                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div> :

                <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
                                            <AlertCircle className="h-8 w-8" />
                                            <span>Impossible de charger les données</span>
                                        </div>
                }
                                </div>
                            </ScrollArea>
                        </>
          }
                </div>

                {/* SQL CLI Terminal - Always Visible at Bottom */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 text-gray-400 mt-auto">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <Terminal className="h-3 w-3" />
                        SQL CLI (Proquelec Souverain)
                    </div>
                    <div className="flex gap-3 h-24">
                        <textarea
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-proqblue transition-colors resize-none"
              placeholder="SELECT * FROM users WHERE role = 'admin'..."
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)} />
            
                        <Button
              className="bg-proqblue hover:bg-proqblue/90 h-full flex flex-col items-center justify-center px-6 rounded-xl gap-2 min-w-[100px] shadow-lg shadow-proqblue/20"
              onClick={runSqlQuery}
              disabled={isLoading}>
              
                            {isLoading ?
              <RefreshCw className="h-5 w-5 animate-spin" /> :

              <Play className="h-5 w-5" />
              }
                            <span className="text-[10px] font-bold uppercase">
                                {isLoading ? "Running..." : "RUN"}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Query Results Overlay/View */}
            {(queryResult || queryStatus) &&
      <div className="absolute inset-0 bg-background z-20 flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card text-foreground">
                        <h3 className="font-bold text-proqblue flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Résultats de la requête
                        </h3>
                        <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              setQueryResult(null);
              setQueryStatus(null);
            }}>
            
                            Fermer les résultats
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 bg-gray-50/30">
                        <div className="p-6">
                            {queryResult && queryResult.length > 0 ?
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    {Object.keys(queryResult[0]).map((key) =>
                      <th key={key} className="px-4 py-3 font-bold text-gray-700">
                                                            {key}
                                                        </th>
                      )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {queryResult.map((row, idx) =>
                    <tr key={idx} className="border-b border-gray-100 bg-white hover:bg-blue-50/20">
                                                        {Object.entries(row).map(([key, val], i) =>
                      <td key={i} className="px-4 py-3 text-gray-600 font-mono">
                                                                <div className="max-w-[300px] truncate overflow-ellipsis" title={String(val)}>
                                                                    {val === null ? "null" : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                </div>
                                                            </td>
                      )}
                                                    </tr>
                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div> :
            queryStatus ?
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="p-4 rounded-full bg-emerald-50 text-emerald-500 mb-4">
                                        <Play className="h-8 w-8" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">Requête exécutée avec succès</h4>
                                    <p className="text-sm text-gray-500">
                                        Commande : <span className="font-mono font-bold text-proqblue">{queryStatus.command}</span> ·
                                        Lignes affectées : <span className="font-mono font-bold text-proqblue">{queryStatus.rowCount}</span>
                                    </p>
                                </div> :

            <div className="text-center p-12 text-gray-400">Aucun résultat à afficher.</div>
            }
                        </div>
                    </ScrollArea>
                </div>
      }
        </div>);

};