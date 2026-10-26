export type LayerKey = 'vegetation' | 'storyPoints' | 'floodRisk' | 'coordinates';

export interface MapPoint {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  x: number;
  y: number;
  color: string;
  symbol: 'canoe' | 'cave' | 'alert';
}

export const MAP_POINTS: MapPoint[] = [
  {
    id: 'landing',
    title: 'Desembarque da canoa',
    shortTitle: 'Desembarque',
    description: 'Ponto de chegada indicado no trabalho. A localização é esquemática.',
    x: 302,
    y: 374,
    color: '#e18a3a',
    symbol: 'canoe',
  },
  {
    id: 'simao',
    title: 'Gruta / abrigo de Simão',
    shortTitle: 'Abrigo de Simão',
    description: 'O material pedagógico consultado descreve Simão vivendo numa gruta da ilha.',
    x: 615,
    y: 245,
    color: '#d76847',
    symbol: 'cave',
  },
  {
    id: 'flood',
    title: 'Área de risco de inundação',
    shortTitle: 'Risco de inundação',
    description: 'Área baixa ilustrativa que pode ser alcançada pela água na simulação de chuva.',
    x: 710,
    y: 366,
    color: '#278ca3',
    symbol: 'alert',
  },
];

export const BOOK_CONTEXT =
  'Henrique e Eduardo exploram uma ilha no rio Paraíba do Sul, perto de Taubaté. Uma cheia afasta a canoa; Henrique encontra Simão, que vive numa gruta, enquanto Eduardo tenta construir uma jangada para voltar.';

export const MAP_NOTICE =
  'As posições são ilustrativas. A escala é fictícia e a grade usa coordenadas simples, não coordenadas reais.';

export const LAYER_LABELS: { key: LayerKey; label: string; helper: string }[] = [
  { key: 'vegetation', label: 'Mata fechada', helper: 'Árvores e vegetação' },
  { key: 'storyPoints', label: 'Pontos da história', helper: 'Canoa e abrigo de Simão' },
  { key: 'floodRisk', label: 'Risco de inundação', helper: 'Áreas baixas e alagadas' },
  { key: 'coordinates', label: 'Coordenadas', helper: 'Grade A–D e 1–4' },
];
