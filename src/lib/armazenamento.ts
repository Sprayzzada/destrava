// O progresso fica só no navegador de quem usa. Se o navegador bloquear, o app segue na memória.

export function ler<T>(chave: string, padrao: T): T {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: segue só na memória */
  }
}

export function apagar(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* nada a fazer */
  }
}
