export interface Club {
  id: string;
  nombre: string;
  nombreCorto: string;
  escudo?: string;
  estadio: string;
  instagramUrl?: string;
  ubicacionEstadio?: string;
}

export interface Jugador {
  id: string;
  rut?: string;
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento?: string;
  numeroJugador?: number;
  posicion?: string;
  club: Club;
}

export interface Jornada {
  id: string;
  numero: number;
  fecha: Date;
  hora: string;
  estado: EstadoJornada;
  esSegundaVuelta: boolean;
}

export interface Partido {
  id: string;
  jornadaId: string;
  jornada: Jornada;
  clubLocal?: Club;
  clubVisitante?: Club;
  estadio: string;
  estado: EstadoPartido;
}

export interface ResultadoSerie {
  id: string;
  partido: Partido;
  tipoSerie: TipoSerie;
  golesLocal: number;
  golesVisitante: number;
  puntosInvertidos: boolean;
  ganadorAdminId?: string;
  mensajeAjuste?: string;
}

export interface Gol {
  id: string;
  resultadoSerie: ResultadoSerie;
  jugador?: Jugador;
  club: Club;
  minuto?: number;
}

export interface TablaPosicion {
  club: Club;
  posicion: number;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
}

export interface GoleadorStats {
  jugador: Jugador;
  goles: number;
}

export interface GoleadorPorSerie {
  jugador: Jugador;
  serie: TipoSerie;
  goles: number;
}

export enum TipoSerie {
  TERCERA = 'TERCERA',
  SEGUNDA = 'SEGUNDA',
  SENIOR = 'SENIOR',
  PRIMERA = 'PRIMERA',
}

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  EN_JUEGO = 'EN_JUEGO',
  FINALIZADO = 'FINALIZADO',
  SUSPENDIDO = 'SUSPENDIDO',
}

export enum EstadoJornada {
  ACTIVA = 'ACTIVA',
  SUSPENDIDA = 'SUSPENDIDA',
  FINALIZADA = 'FINALIZADA',
}
