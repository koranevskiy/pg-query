import { ColumnsNames, TableNames, TablesDefinition } from 'src/lib/types/select.types';
import { QueryRunner } from 'src/lib/types/query-builder.types';
import { getSafeColumnName, getSafeTableName } from 'src/lib/utils/table.utils';
import { JoinStatement } from 'src/lib/types/join.types';

class QueryBuilder<T extends TablesDefinition<T>> {
  private isSelected = false;

  private selectedColumns: string[] = [];

  private selectTables: string[] = [];

  private tableAlias: Record<string, string> = {};

  private joinStatements: JoinStatement[] = [];

  constructor(private readonly queryRunner: QueryRunner) {}

  private registerTableAlias(tableName: string, tableAlias: string): void {
    if (tableAlias in this.tableAlias) {
      throw new Error(`TableAlias ${tableAlias} already exists`);
    }
    this.tableAlias[tableAlias] = tableName as string;
  }

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

  public leftJoinAndSelect<TKey extends TableNames<T>>(
    tableName: TKey,
    columnNames: ColumnsNames<T, TKey>[],
    tableAlias?: string
  ) {
    return this;
  }

  public get rawQuery(): string {
    const resultQuery: string[] = [];

    if (this.isSelected) {
      resultQuery.push('select');
      resultQuery.push(this.selectedColumns.join(','));
      resultQuery.push('from');
      resultQuery.push(this.selectTables.join(','));
    }

    return resultQuery.join(' ');
  }
}

export { QueryBuilder };
