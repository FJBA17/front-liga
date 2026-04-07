import { TipoSerie } from '../types';

export const seriesColors = {
  [TipoSerie.TERCERA]: {
    bg: 'bg-series-tercera',
    text: 'text-series-tercera',
    border: 'border-series-tercera',
    gradient: 'from-series-tercera/20 to-transparent',
    hex: '#ef4444',
  },
  [TipoSerie.SEGUNDA]: {
    bg: 'bg-series-segunda',
    text: 'text-series-segunda',
    border: 'border-series-segunda',
    gradient: 'from-series-segunda/20 to-transparent',
    hex: '#8b5cf6',
  },
  [TipoSerie.SENIOR]: {
    bg: 'bg-series-senior',
    text: 'text-series-senior',
    border: 'border-series-senior',
    gradient: 'from-series-senior/20 to-transparent',
    hex: '#a78bfa',
  },
  [TipoSerie.PRIMERA]: {
    bg: 'bg-series-primera',
    text: 'text-series-primera',
    border: 'border-series-primera',
    gradient: 'from-series-primera/20 to-transparent',
    hex: '#c71585',
  },
};

export const seriesNames = {
  [TipoSerie.TERCERA]: 'Tercera',
  [TipoSerie.SEGUNDA]: 'Segunda',
  [TipoSerie.SENIOR]: 'Senior',
  [TipoSerie.PRIMERA]: 'Primera',
};

export const seriesIcons = {
  [TipoSerie.TERCERA]: '🥉',
  [TipoSerie.SEGUNDA]: '🥈',
  [TipoSerie.SENIOR]: '👴',
  [TipoSerie.PRIMERA]: '🥇',
};
