import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const GRAPHQL_URI = process.env.SNAPSHOT_GRAPHQL_URI || 'http://localhost:3000/graphql';
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '../src/graphql/snapshot/data.json');

function canonicalStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(value[k])}`).join(',')}}`;
}

async function gql(operationName, query, variables = {}) {
  const res = await fetch(GRAPHQL_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName, query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`${operationName}(${JSON.stringify(variables)}) failed: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const queries = {
  GetClubes: `query GetClubes { clubes { id nombre nombreCorto estadio instagramUrl ubicacionEstadio } }`,
  GetClub: `query GetClub($id: ID!) { club(id: $id) { id nombre nombreCorto estadio instagramUrl ubicacionEstadio } }`,
  GetTablaPosiciones: `query GetTablaPosiciones { tablaPosiciones { club { id nombre nombreCorto } posicion puntos partidosJugados partidosGanados partidosEmpatados partidosPerdidos golesAFavor golesEnContra diferenciaGoles } }`,
  GetGolesEncajadosPorSerie: `query GetGolesEncajadosPorSerie { golesEncajadosPorSerie { serie clubes { club { id nombre nombreCorto } golesEncajados } } }`,
  GetJornadas: `query GetJornadas { jornadas { id numero fecha hora estado esSegundaVuelta } }`,
  GetPartidosByJornada: `query GetPartidosByJornada($jornadaId: ID!) { partidosPorJornada(jornadaId: $jornadaId) { id clubLocal { id nombre nombreCorto ubicacionEstadio } clubVisitante { id nombre nombreCorto ubicacionEstadio } estadio estado jornada { numero fecha hora } } }`,
  GetPartidosByClub: `query GetPartidosByClub($clubId: ID!) { partidosPorClub(clubId: $clubId) { id clubLocal { id nombre nombreCorto } clubVisitante { id nombre nombreCorto } estadio estado jornada { id numero fecha hora estado } } }`,
  GetResultadosByPartido: `query GetResultadosByPartido($partidoId: ID!) { resultadosPorPartido(partidoId: $partidoId) { id tipoSerie golesLocal golesVisitante puntosInvertidos ganadorAdminId mensajeAjuste } }`,
  GetGolesPorPartido: `query GetGolesPorPartido($partidoId: ID!) { golesPorPartido(partidoId: $partidoId) { id club { id } jugador { id nombre1 apellido1 apellido2 } resultadoSerie { tipoSerie } } }`,
  GetGoleadoresPorSerie: `query GetGoleadoresPorSerie { goleadoresPorSerie { jugador { id nombre1 nombre2 apellido1 apellido2 club { id nombre nombreCorto } } serie goles } }`,
  GetGoleadoresByClub: `query GetGoleadoresByClub($clubId: ID!) { golesPorClub(clubId: $clubId) { id jugador { id nombre1 nombre2 apellido1 apellido2 } club { id nombre nombreCorto } resultadoSerie { tipoSerie } } }`,
  GetAvisosActivos: `query GetAvisosActivos { avisosActivos { id titulo mensaje tipo createdAt } }`,
};

const snapshot = {};

function store(operationName, variables, data) {
  snapshot[`${operationName}::${canonicalStringify(variables)}`] = data;
}

async function main() {
  console.log('Capturando snapshot desde', GRAPHQL_URI);

  const clubesData = await gql('GetClubes', queries.GetClubes);
  store('GetClubes', {}, clubesData);

  const jornadasData = await gql('GetJornadas', queries.GetJornadas);
  store('GetJornadas', {}, jornadasData);

  store('GetTablaPosiciones', {}, await gql('GetTablaPosiciones', queries.GetTablaPosiciones));
  store('GetGolesEncajadosPorSerie', {}, await gql('GetGolesEncajadosPorSerie', queries.GetGolesEncajadosPorSerie));
  store('GetGoleadoresPorSerie', {}, await gql('GetGoleadoresPorSerie', queries.GetGoleadoresPorSerie));
  store('GetAvisosActivos', {}, await gql('GetAvisosActivos', queries.GetAvisosActivos));

  const clubIds = clubesData.clubes.map((c) => c.id);
  const jornadaIds = jornadasData.jornadas.map((j) => j.id);

  for (const id of clubIds) {
    store('GetClub', { id }, await gql('GetClub', queries.GetClub, { id }));
    store('GetGoleadoresByClub', { clubId: id }, await gql('GetGoleadoresByClub', queries.GetGoleadoresByClub, { clubId: id }));
    store('GetPartidosByClub', { clubId: id }, await gql('GetPartidosByClub', queries.GetPartidosByClub, { clubId: id }));
  }

  const partidoIds = new Set();
  for (const jornadaId of jornadaIds) {
    const data = await gql('GetPartidosByJornada', queries.GetPartidosByJornada, { jornadaId });
    store('GetPartidosByJornada', { jornadaId }, data);
    for (const p of data.partidosPorJornada) partidoIds.add(p.id);
  }

  for (const partidoId of partidoIds) {
    store('GetResultadosByPartido', { partidoId }, await gql('GetResultadosByPartido', queries.GetResultadosByPartido, { partidoId }));
    store('GetGolesPorPartido', { partidoId }, await gql('GetGolesPorPartido', queries.GetGolesPorPartido, { partidoId }));
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(snapshot));
  console.log(`Snapshot escrito en ${OUT_FILE} con ${Object.keys(snapshot).length} entradas`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
