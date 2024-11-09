import { TablesDefinition } from './query-builder.types';

type TableNames<T extends TablesDefinition<T>> = keyof T;

type ColumnsNames<T extends TablesDefinition<T>, B extends TableNames<T>> =
  B extends TableNames<T> ? keyof T[B] : never;

export { TablesDefinition, TableNames, ColumnsNames };
