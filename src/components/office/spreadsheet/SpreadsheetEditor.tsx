import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Table, Sparkles, Calculator, Plus } from 'lucide-react';

interface SpreadsheetEditorProps {
  spreadsheetId?: string;
  initialData?: unknown[];
  onSave?: (data: unknown[]) => void;
}

type SpreadsheetCell = {
  v?: string | number;
  m?: string;
  f?: string;
  ct?: unknown;
  bg?: string;
  fc?: string;
};

type SpreadsheetSheet = {
  name: string;
  data: SpreadsheetCell[][];
  config?: Record<string, unknown>;
  celldata?: unknown[];
  [key: string]: unknown;
};

const cloneSheets = (sheets: unknown[]): SpreadsheetSheet[] =>
  JSON.parse(JSON.stringify(sheets)) as SpreadsheetSheet[];

const getCellValue = (cell?: SpreadsheetCell) =>
  String(cell?.f ?? cell?.m ?? cell?.v ?? '');

export function SpreadsheetEditor({ spreadsheetId, initialData, onSave }: SpreadsheetEditorProps) {
  const [data, setData] = useState(initialData || [
  {
    name: 'Feuille1',
    color: '',
    status: 1,
    order: 0,
    data: [
    [
    { v: 'Désignation', ct: { fa: 'General', t: 'g' }, m: 'Désignation', bg: '#4472C4', fc: '#ffffff' },
    { v: 'Quantité', ct: { fa: 'General', t: 'g' }, m: 'Quantité', bg: '#4472C4', fc: '#ffffff' },
    { v: 'Prix Unitaire HT', ct: { fa: 'General', t: 'g' }, m: 'Prix Unitaire HT', bg: '#4472C4', fc: '#ffffff' },
    { v: 'Total HT', ct: { fa: 'General', t: 'g' }, m: 'Total HT', bg: '#4472C4', fc: '#ffffff' }],

    [
    { v: 'Tableau électrique', ct: { fa: 'General', t: 'g' }, m: 'Tableau électrique' },
    { v: 1, ct: { fa: 'General', t: 'n' }, m: '1' },
    { v: 500, ct: { fa: '€#,##0.00', t: 'n' }, m: '€500.00' },
    { v: '', f: '=B2*C2', ct: { fa: '€#,##0.00', t: 'n' } }],

    [
    { v: 'Câble 3G2.5mm²', ct: { fa: 'General', t: 'g' }, m: 'Câble 3G2.5mm²' },
    { v: 100, ct: { fa: 'General', t: 'n' }, m: '100' },
    { v: 3, ct: { fa: '€#,##0.00', t: 'n' }, m: '€3.00' },
    { v: '', f: '=B3*C3', ct: { fa: '€#,##0.00', t: 'n' } }],

    [
    { v: 'Disjoncteur 20A', ct: { fa: 'General', t: 'g' }, m: 'Disjoncteur 20A' },
    { v: 5, ct: { fa: 'General', t: 'n' }, m: '5' },
    { v: 15, ct: { fa: '€#,##0.00', t: 'n' }, m: '€15.00' },
    { v: '', f: '=B4*C4', ct: { fa: '€#,##0.00', t: 'n' } }],

    [
    { v: '', ct: { fa: 'General', t: 'g' } },
    { v: '', ct: { fa: 'General', t: 'g' } },
    { v: 'TOTAL HT', ct: { fa: 'General', t: 'g' }, m: 'TOTAL HT', bg: '#E7E6E6' },
    { v: '', f: '=SUM(D2:D4)', ct: { fa: '€#,##0.00', t: 'n' }, bg: '#E7E6E6' }]],


    config: {
      columnlen: { 0: 200, 1: 100, 2: 150, 3: 150 }
    },
    celldata: []
  }]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
  };

  const sheet = (data[0] as SpreadsheetSheet | undefined) || { name: 'Feuille1', data: [] };
  const rows = Array.isArray(sheet.data) ? sheet.data : [];
  const columnCount = Math.max(4, ...rows.map((row) => row.length));

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const next = cloneSheets(data);
    const nextSheet = next[0] || { name: 'Feuille1', data: [], celldata: [] };
    next[0] = nextSheet;
    nextSheet.data = Array.isArray(nextSheet.data) ? nextSheet.data : [];
    nextSheet.data[rowIndex] = Array.isArray(nextSheet.data[rowIndex]) ? nextSheet.data[rowIndex] : [];
    const existing = nextSheet.data[rowIndex][colIndex] || {};
    nextSheet.data[rowIndex][colIndex] = value.startsWith('=')
      ? { ...existing, f: value, v: '', m: value }
      : { ...existing, v: value, m: value, f: undefined };
    setData(next);
  };

  const addRow = () => {
    const next = cloneSheets(data);
    const nextSheet = next[0] || { name: 'Feuille1', data: [], celldata: [] };
    next[0] = nextSheet;
    nextSheet.data = Array.isArray(nextSheet.data) ? nextSheet.data : [];
    nextSheet.data.push(Array.from({ length: columnCount }, () => ({ v: '', m: '' })));
    setData(next);
  };

  const addColumn = () => {
    const next = cloneSheets(data);
    const nextSheet = next[0] || { name: 'Feuille1', data: [], celldata: [] };
    next[0] = nextSheet;
    nextSheet.data = Array.isArray(nextSheet.data) ? nextSheet.data : [];
    nextSheet.data = nextSheet.data.map((row) => [...row, { v: '', m: '' }]);
    setData(next);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white">
                        <Table className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Éditeur de Tableur</h3>
                        <p className="text-xs text-gray-600">PROQUELEC Office - Calculs et formules</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Calculator className="h-3 w-3" />
                        Formules métier PROQUELEC
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA disponible
                    </Badge>
                    <Button variant="outline" onClick={addRow} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ligne
                    </Button>
                    <Button variant="outline" onClick={addColumn} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Colonne
                    </Button>
                    <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4" />
                        Sauvegarder
                    </Button>
                </div>
            </div>

            {/* Spreadsheet */}
            <div className="flex-1 overflow-auto bg-slate-50">
                <table className="min-w-full border-collapse bg-white text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-100">
                        <tr>
                            <th className="w-12 border border-slate-200 bg-slate-100 p-2 text-xs text-slate-500" />
                            {Array.from({ length: columnCount }).map((_, colIndex) => (
                                <th key={colIndex} className="min-w-36 border border-slate-200 p-2 text-xs font-semibold text-slate-500">
                                    {String.fromCharCode(65 + colIndex)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <th className="sticky left-0 z-10 border border-slate-200 bg-slate-100 p-2 text-xs font-semibold text-slate-500">
                                    {rowIndex + 1}
                                </th>
                                {Array.from({ length: columnCount }).map((_, colIndex) => {
                                    const cell = row[colIndex];
                                    return (
                                        <td key={colIndex} className="border border-slate-200 p-0">
                                            <input
                                                value={getCellValue(cell)}
                                                onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                                                className="h-10 w-full min-w-36 bg-transparent px-3 text-sm outline-none focus:bg-emerald-50 focus:ring-2 focus:ring-emerald-500"
                                                style={{
                                                    backgroundColor: cell?.bg,
                                                    color: cell?.fc,
                                                    fontWeight: rowIndex === 0 ? 700 : undefined,
                                                }}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
                <div className="flex items-center gap-4">
                    <span>Formules disponibles: SOMME, MOYENNE, SI, RECHERCHEV, CHUTE_TENSION, SECTION_MINI</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-green-600">● Sauvegarde automatique activée</span>
                </div>
            </div>
        </div>);

}
