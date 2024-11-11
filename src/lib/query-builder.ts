import { ColumnsNames, TableNames, TablesDefinition } from 'src/lib/types/select.types';
import { QueryParams, QueryRunner } from 'src/lib/types/query-builder.types';
import { getSafeColumnName, getSafeTableName } from 'src/lib/utils/table.utils';
import { JoinStatement, JoinType, WhereToJoinTableIdentity } from 'src/lib/types/join.types';

class QueryBuilder<T extends TablesDefinition<T>> {
  private isSelected = false;

  private selectedColumns: string[] = [];

  private selectTables: string[] = [];

  private tableAlias: Record<string, string> = {};

  private isJoined = false;

  private joinStatements: JoinStatement[] = [];

  private params: any[] = [];

  private paramNum = 1;

  private isWhere = false;

  private whereStatements: string[] = [];

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

  private findJoinStatement(tableIdentity: WhereToJoinTableIdentity<T>): JoinStatement {
    const statement = this.joinStatements.find(
      ({ tableName }) => getSafeTableName(tableIdentity.tableName as string, tableIdentity.tableAlias) === tableName
    );
    if (!statement) {
      throw new Error(
        `Unable to find join table where name = ${tableIdentity.tableName as string} and alias = ${
          tableIdentity.tableAlias
        }`
      );
    }
    return statement;
  }

  private join<TKey extends TableNames<T>>(
    tableName: TKey,
    columnNames: ColumnsNames<T, TKey>[],
    type: JoinType,
    tableAlias?: string
  ) {
    if (!this.isJoined) {
      this.isJoined = true;
    }

    if (tableAlias) {
      this.registerTableAlias(tableName as string, tableAlias);
    }

    const columnsToSelect = columnNames.map(col => getSafeColumnName(col as string, tableName as string, tableAlias));
    this.joinStatements.push({
      type,
      tableAlias,
      tableName: getSafeTableName(tableName as string, tableAlias),
      selectedColumns: columnsToSelect,
      where: [],
    });

    return this;
  }

  private parametrizeStatement(rawSql: string, params?: QueryParams) {
    if (!params) {
      return rawSql;
    }
    const paramsEntries = Object.entries(params);
    let resultSql = rawSql;
    for (const [placeholder, value] of paramsEntries) {
      const fullPlaceholder = `:${placeholder}`;
      if (!resultSql.includes(fullPlaceholder)) {
        continue;
      }
      resultSql = resultSql.replaceAll(fullPlaceholder, `$${this.paramNum++}`);
      this.params.push(value);
    }
    return resultSql;
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
    return this.join(tableName, columnNames, 'left', tableAlias);
  }

  public rightJoinAndSelect<TKey extends TableNames<T>>(
    tableName: TKey,
    columnNames: ColumnsNames<T, TKey>[],
    tableAlias?: string
  ) {
    return this.join(tableName, columnNames, 'right', tableAlias);
  }

  public fullOuterJoinAndSelect<TKey extends TableNames<T>>(
    tableName: TKey,
    columnNames: ColumnsNames<T, TKey>[],
    tableAlias?: string
  ) {
    return this.join(tableName, columnNames, 'full outer', tableAlias);
  }

  public whereToJoin(tableIdentity: WhereToJoinTableIdentity<T>, rawWhere: string, params?: QueryParams) {
    const statement = this.findJoinStatement(tableIdentity);
    const paramSql = this.parametrizeStatement(rawWhere, params);
    statement.where.push(paramSql);
    return this;
  }

  public where(rawWhere: string, params?: QueryParams) {
    if (!this.isWhere) {
      this.isWhere = true;
    }
    const paramsSql = this.parametrizeStatement(rawWhere, params);
    this.whereStatements.push(paramsSql);
    return this;
  }

  public get rawQuery(): string {
    let resultQuery: string[] = [];

    const selectTables: string[] = []

    const selectedColumns: string[] = [];

    const joinStatements: string[] = [];

    if (this.isSelected) {
      selectedColumns.push(this.selectedColumns.join(','));
      selectTables.push(this.selectTables.join(','));
    }

    if (this.isJoined) {
      for (const statement of this.joinStatements) {
        selectedColumns.push(statement.selectedColumns.join(','));
        const joinStatement = `${statement.type} join ${statement.tableName} on ${statement.where.join(' ')}`
        joinStatements.push(joinStatement);
      }
    }

    if(this.isSelected) {
      resultQuery.push('select')
      resultQuery = resultQuery.concat(selectedColumns)
      resultQuery.push('from')
      resultQuery = resultQuery.concat(selectTables)
    }

    if(this.isJoined) {
      resultQuery = resultQuery.concat(joinStatements)
    }

    if (this.isWhere) {
      resultQuery.push('where')
      resultQuery = resultQuery.concat(this.whereStatements);
    }

    // console.log({
    //   resultQuery,
    //   selectedColumns,
    //   selectTables,
    //   joinStatements
    // })

    return resultQuery.join(' ');
  }
}

export { QueryBuilder };
