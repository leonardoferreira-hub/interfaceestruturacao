import * as XLSX from 'xlsx';
import type { CostItem } from '@/components/estruturacao/tabs/despesas/CostRow';
import { formatCurrency } from '@/utils/formatters';

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const COLS = ['Despesas', 'Agente', 'Base de Cálculo', 'Valor Líquido', 'Alíquota', 'Valor Bruto'];

function mapRow(item: CostItem) {
  const base = item.tipo === 'input' ? 'Fixo' : item.tipo === 'calculado' ? 'Percentual' : 'Auto';
  const aliquota = item.grossUp ?? 0;
  return [
    item.papel || item.prestador,
    item.prestador,
    base,
    item.valor ?? 0,
    `${aliquota.toFixed(2)}%`,
    item.valorBruto ?? 0,
  ];
}

function section(title: string, items: CostItem[]) {
  const rows: any[][] = [];
  rows.push([title]);
  rows.push(COLS);
  items.forEach((i) => rows.push(mapRow(i)));
  const totalLiquido = items.reduce((s, i) => s + (i.valor ?? 0), 0);
  const totalBruto = items.reduce((s, i) => s + (i.valorBruto ?? 0), 0);
  rows.push(['Total', '', '', totalLiquido, '', totalBruto]);
  rows.push([]);
  return rows;
}

export function exportDespesasLayoutToExcel(params: {
  numeroEmissao: string;
  volumeEmissao: number;
  upfront: CostItem[];
  anual: CostItem[];
  mensal: CostItem[];
}) {
  const { numeroEmissao, volumeEmissao, upfront, anual, mensal } = params;

  const aoa: any[][] = [];
  aoa.push([`Volume da Emissão`, volumeEmissao]);
  aoa.push([]);

  aoa.push(...section('DESPESAS FLAT - Up front', upfront));
  aoa.push(...section('DESPESAS ANUAIS', anual));
  aoa.push(...section('DESPESAS MENSAIS', mensal));

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set column widths (aprox. como o layout do exemplo)
  ws['!cols'] = [
    { wch: 28 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
  ];

  // Format currency columns loosely
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    // Valor Líquido (D) and Valor Bruto (F)
    const d = XLSX.utils.encode_cell({ r: R, c: 3 });
    const f = XLSX.utils.encode_cell({ r: R, c: 5 });
    if (ws[d] && typeof ws[d].v === 'number') ws[d].z = 'R$ #,##0.00';
    if (ws[f] && typeof ws[f].v === 'number') ws[f].z = 'R$ #,##0.00';
    const b = XLSX.utils.encode_cell({ r: R, c: 1 });
    if (ws[b] && typeof ws[b].v === 'number') ws[b].z = 'R$ #,##0.00';
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Despesas');

  downloadWorkbook(wb, `${numeroEmissao}_despesas.xlsx`);
}
