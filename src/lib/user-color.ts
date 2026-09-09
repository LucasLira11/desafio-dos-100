// Paleta de cores de identidade que o usuário escolhe no cadastro.
// Se ninguém escolher, o 1º membro do grupo usa verde e o 2º usa roxo.
export const USER_COLOR_PALETTE = [
  { name: "Verde", value: "#22c55e" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Laranja", value: "#f97316" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Âmbar", value: "#eab308" },
  { name: "Vermelho", value: "#ef4444" },
] as const;

export const DEFAULT_USER_COLORS = ["#22c55e", "#a855f7"];

export function getUserColor(color: string | null | undefined, fallbackIndex: number = 0) {
  return color || DEFAULT_USER_COLORS[fallbackIndex % DEFAULT_USER_COLORS.length];
}

// Sufixo hex de alpha (00-FF) para usar em tons translúcidos de uma cor dinâmica,
// já que o Tailwind não consegue gerar classes para cores escolhidas em runtime.
export function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}
