import { ApolloLink, Observable } from '@apollo/client';
import snapshot from './snapshot/data.json';

function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(record[k])}`).join(',')}}`;
}

const snapshotData = snapshot as Record<string, unknown>;

export const staticLink = new ApolloLink((operation) => {
  const key = `${operation.operationName}::${canonicalStringify(operation.variables ?? {})}`;
  const data = snapshotData[key];

  return new Observable((observer) => {
    if (data === undefined) {
      observer.error(new Error(`No hay snapshot para "${key}". Regenera con "npm run build:snapshot".`));
      return;
    }
    observer.next({ data });
    observer.complete();
  });
});
