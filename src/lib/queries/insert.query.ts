import { QueryParams, SharedQueryBuilderMethod, TablesDefinition } from 'src/lib/types/query-builder.types';
import { TableNames } from 'src/lib/types/select.types';
import { getSafeTableName } from 'src/lib/utils/table.utils';

interface InsertSqlOption {
  sql: string;
  params?: QueryParams;
}

type InsertValues<T> = {
  [key in keyof T]?: T[key] | InsertSqlOption;
};

class InsertQueryBuilder<T extends TablesDefinition<T>> extends SharedQueryBuilderMethod {
  protected isInserted = false;

  private insertQuery: string[] = [];

  public insert<TKey extends TableNames<T>, TValues extends T[TKey]>(
    tableName: TKey,
    values: InsertValues<TValues> | InsertValues<TValues>[]
  ) {
    if (this.insertQuery.length) {
      throw new Error('Insert query failed. Can not call this method twice at one QueryBuilder instance');
    }
    if (!this.isInserted) {
      this.isInserted = true;
      // TODO: Remake it when will add insert from select functionality
      this.insertQuery.push(`INSERT INTO ${getSafeTableName(tableName as string)}`);
    }

    const resultValues = Array.isArray(values) ? values : [values];
    if (!resultValues || !resultValues[0]) {
      throw new Error('Insert query failed. Values provided incorrectly');
    }
    const keys = Object.keys(resultValues[0]).reduce((acc, cur) => {
      acc.push(getSafeTableName(cur));
      return acc;
    }, [] as string[]);
    this.insertQuery.push('(', keys.join(','), ')', 'VALUES');

    for (const row of resultValues) {
      const values = Object.values(row) as any[];
      const insertValuesRow: string[] = [];
      for (const value of values) {
        if (value && typeof value.sql === 'string') {
          insertValuesRow.push(this.parametrizeStatement(value.sql, value.params));
        } else {
          insertValuesRow.push(`$${this.paramNum++}`);
          this.params.push(value);
        }
      }
      this.insertQuery.push('(', insertValuesRow.join(','), ')');
    }

    return this;
  }

  protected buildInsertQuery(): string {
    if (!this.isInserted) {
      return null;
    }
    return this.insertQuery.join(' ')
  }
}

export { InsertQueryBuilder };
