/**
 * Retorna o valor financeiro total de um desafio utilizando a fórmula de soma de Progressão Aritmética.
 * Padrão: 1 a 100 com incremento de 1 = (100 * (1 + 100)) / 2 = 5050.
 */
export function getChallengeTotal(start: number = 1, end: number = 100, increment: number = 1): number {
  const n = Math.floor((end - start) / increment) + 1;
  return (n * (start + end)) / 2;
}

/**
 * Soma o valor de todos os depósitos realizados.
 */
export function getCompletedAmount(deposits: { amount: number | string }[]): number {
  return deposits.reduce((acc, curr) => acc + Number(curr.amount), 0);
}

/**
 * Calcula a porcentagem do progresso financeiro de forma segura.
 */
export function getProgressPercentage(completedAmount: number, totalAmount: number): number {
  if (totalAmount === 0) return 0;
  const percentage = (completedAmount / totalAmount) * 100;
  return Math.min(100, Math.max(0, percentage)); // Garante que fique entre 0 e 100
}

/**
 * Descobre qual é o próximo depósito sugerido.
 * Procura o primeiro número (de 1 a 100) que não existe no array de passos concluídos.
 */
export function getNextDeposit(completedSteps: number[], maxSteps: number = 100): number | null {
  for (let i = 1; i <= maxSteps; i++) {
    if (!completedSteps.includes(i)) {
      return i; // Retorna o primeiro número ausente
    }
  }
  return null; // Todos completados
}