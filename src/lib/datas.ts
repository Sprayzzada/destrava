/** Data local no formato AAAA-MM-DD. */
export function hojeISO(d = new Date()): string {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${a}-${m}-${dia}`;
}

export function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return hojeISO(new Date(a, m - 1, d + n));
}

export function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split('-').map(Number);
  const [a2, m2, d2] = ate.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function diaDaSemana(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return DIAS_SEMANA[new Date(a, m - 1, d).getDay()];
}

export function quandoVence(hoje: string, vence: string): string {
  const n = diasEntre(hoje, vence);
  if (n <= 0) return 'hoje';
  if (n === 1) return 'amanhã';
  return `em ${n} dias`;
}
