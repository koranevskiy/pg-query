import { SharedQueryBuilderMethod } from 'src/lib/types/query-builder.types';
import { getSafeColumnName, getSafeTableName } from 'src/lib/utils/table.utils';
import { ColumnsNames, TableNames } from 'src/lib/types/select.types';

class SelectQueryBuilder<T> extends SharedQueryBuilderMethod {
  protected isSelected = false;

  protected selectedColumns: string[] = [];

  protected selectTables: string[] = [];

  private addSelectColumn(column: string, tableName: string, tableAlias?: string): void {
    this.selectedColumns.push(getSafeColumnName(column as string, tableName, tableAlias));
  }

  private addTableSelect(tableName: string, tableAlias?: string): void {
    this.selectTables.push(getSafeTableName(tableName, tableAlias));
  }

  public select<TKey extends TableNames<T>>(
    tableName: TKey,
    columnNames: ColumnsNames<T, TKey>[],
    tableAlias?: string
  ) {
    if (!this.isSelected) {
      this.isSelected = true;
    }
    if (tableAlias) {
      this.registerTableAlias(tableName as string, tableAlias);
    }
    for (const column of columnNames) {
      this.addSelectColumn(column as string, tableName as string, tableAlias);
    }
    this.addTableSelect(tableName as string, tableAlias);
    return this;
  }
}

export { SelectQueryBuilder };
