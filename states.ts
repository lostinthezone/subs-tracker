export const usePlayers = () => useState<string[]>('players', () => [])

export const useSubTime = () => useState<number>('subTime', () => 240)