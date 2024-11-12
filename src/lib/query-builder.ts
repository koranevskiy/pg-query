import { ColumnsNames, TableNames, TablesDefinition } from 'src/lib/types/select.types';
import { QueryParams, QueryRunner } from 'src/lib/types/query-builder.types';
import { getSafeColumnName, getSafeTableName } from 'src/lib/utils/table.utils';
import { JoinStatement, JoinType, WhereToJoinTableIdentity } from 'src/lib/types/join.types';
import { applyMixinsAndInstanate } from 'src/lib/utils/mixin.utils';
import { OffsetQueryBuilder } from 'src/lib/queries/offset.query';
import { LimitQueryBuilder } from './queries/limit.query';
import { OrderByQueryBuilder } from './queries/order-by.query';
import { SelectQueryBuilder } from 'src/lib/queries/select.query';

interface QueryBuilder<T extends TablesDefinition<T>>
  extends OffsetQueryBuilder,
    LimitQueryBuilder,
    OrderByQueryBuilder,
    SelectQueryBuilder<T> {}

class QueryBuilder<T extends TablesDefinition<T>> {
  protected tableAlias: Record<string, string> = {};

  private isJoined = false;

  private joinStatements: JoinStatement[] = [];

  private params: any[] = [];

  private paramNum = 1;

  private isWhere = false;

  private whereStatements: string[] = [];

  constructor(private readonly queryRunner: QueryRunner) {}

  protected registerTableAlias(tableName: string, tableAlias: string): void {
    if (tableAlias in this.tableAlias) {
      throw new Error(`TableAlias ${tableAlias} already exists`);
    }
    this.tableAlias[tableAlias] = tableName as string;
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

  protected parametrizeStatement(rawSql: string, params?: QueryParams): string {
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

    const selectTables: string[] = [];

    const selectedColumns: string[] = [];

    const joinStatements: string[] = [];

    if (this.isSelected) {
      selectedColumns.push(this.selectedColumns.join(','));
      selectTables.push(this.selectTables.join(','));
    }

    if (this.isJoined) {
      for (const statement of this.joinStatements) {
        selectedColumns.push(statement.selectedColumns.join(','));
        const joinStatement = `${statement.type} JOIN ${statement.tableName} ON ${statement.where.join(' ')}`;
        joinStatements.push(joinStatement);
      }
    }

    if (this.isSelected) {
      resultQuery.push('SELECT');
      resultQuery = resultQuery.concat(selectedColumns);
      resultQuery.push('FROM');
      resultQuery = resultQuery.concat(selectTables);
    }

    if (this.isJoined) {
      resultQuery = resultQuery.concat(joinStatements);
    }

    if (this.isWhere) {
      resultQuery.push('WHERE');
      resultQuery = resultQuery.concat(this.whereStatements);
    }

    if (this.isOrder) {
      resultQuery.push(this.buildOrderByQuery());
    }

    if (this.isLimit) {
      resultQuery.push(this.buildLimitQuery());
    }
    if (this.isOffset) {
      resultQuery.push(this.buildOffsetQuery());
    }

    return resultQuery.join(' ');
  }
}

const ProxyQueryBuilder = applyMixinsAndInstanate(QueryBuilder, [
  OffsetQueryBuilder,
  LimitQueryBuilder,
  OrderByQueryBuilder,
  SelectQueryBuilder,
]);

function queryBuilderFactory<T extends TablesDefinition<T>>(queryRunner: QueryRunner): QueryBuilder<T> {
  return new ProxyQueryBuilder(queryRunner);
}

export { queryBuilderFactory as qb };
