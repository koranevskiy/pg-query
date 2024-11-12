import { OrderByOptions } from 'src/lib/types/select.types';
import { getSafeColumnName } from 'src/lib/utils/table.utils';
import { escapeIdentifier } from 'pg';

class OrderByQueryBuilder {

  protected isOrder = false;

  protected orderStatements: string[] = [];

  public orderBy(options: OrderByOptions) {
    const { name, nulls = 'FIRST', expression, direction = 'ASC' } = options;
    if (!expression && !name) {
      throw new Error('Order by must contains name or expression options');
    }
    if (expression && name) {
      throw new Error('Order by must contain only name or expression option');
    }
    if (!this.isOrder) {
      this.isOrder = true;
    }
    let resultStatement: string;

    if (name) {
      // need to find table schema or table prefix => schema = schema|alias|col
      const [schema, colName] = name.split('.');
      if (colName) {
        resultStatement = getSafeColumnName(colName, '', schema);
      } else {
        resultStatement = escapeIdentifier(schema);
      }
    }
    if (expression) {
      resultStatement = expression;
    }
    this.orderStatements.push(`${resultStatement} ${direction} NULLS ${nulls}`);
    return this;
  }

  protected buildOrderByQuery() {
    if (this.isOrder) {
      return `ORDER BY ${this.orderStatements.join(', ')}`;
    }
    return '';
  }
}

export { OrderByQueryBuilder };
