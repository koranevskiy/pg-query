import { TablesDefinition } from './query-builder.types';

type TableNames<T extends TablesDefinition<T>> = keyof T;

type ColumnsNames<T extends TablesDefinition<T>, B extends TableNames<T>> = B extends TableNames<T>
  ? keyof T[B]
  : never;

type OrderDirection = 'ASC' | 'DESC';

type OrderNulls = 'FIRST' | 'LAST';

interface OrderByOptions {
  direction?: OrderDirection;
  nulls?: OrderNulls;
  name?: string;
  expression?: string
}

export { TablesDefinition, TableNames, ColumnsNames, OrderDirection, OrderNulls, OrderByOptions };
