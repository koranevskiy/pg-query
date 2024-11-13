import { TablesDefinition } from 'src/lib/types/select.types';
import { QueryParams, QueryRunner, SharedQueryBuilderMethod } from 'src/lib/types/query-builder.types';
import { applyMixinsAndInstanate } from 'src/lib/utils/mixin.utils';
import { OffsetQueryBuilder } from 'src/lib/queries/offset.query';
import { LimitQueryBuilder } from './queries/limit.query';
import { OrderByQueryBuilder } from './queries/order-by.query';
import { SelectQueryBuilder } from 'src/lib/queries/select.query';
import { WhereQueryBuilder } from 'src/lib/queries/where.query';
import { JoinQueryBuilder } from 'src/lib/queries/join.query';
import { InsertQueryBuilder } from 'src/lib/queries/insert.query';

interface QueryBuilder<T extends TablesDefinition<T>>
  extends OffsetQueryBuilder,
    LimitQueryBuilder,
    OrderByQueryBuilder,
    SelectQueryBuilder<T>,
    WhereQueryBuilder,
    JoinQueryBuilder<T>,
    InsertQueryBuilder<T> {}

class QueryBuilder<T extends TablesDefinition<T>> extends SharedQueryBuilderMethod {
  protected tableAlias: Record<string, string> = {};

  protected params: any[] = [];

  protected paramNum = 1;

  constructor(private readonly queryRunner: QueryRunner) {
    super();
  }

  protected registerTableAlias(tableName: string, tableAlias: string): void {
    if (tableAlias in this.tableAlias) {
      throw new Error(`TableAlias ${tableAlias} already exists`);
    }
    this.tableAlias[tableAlias] = tableName as string;
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

  public get rawQuery(): string {

    if(this.isInserted) {
      console.log(this.params)
      return this.buildInsertQuery()
    }

    let resultQuery: string[] = [];

    const selectTables: string[] = [];

    let selectedColumns: string[] = [];

    let joinStatements: string[] = [];

    if (this.isSelected) {
      selectedColumns.push(this.selectedColumns.join(','));
      selectTables.push(this.selectTables.join(','));
    }

    if (this.isJoined) {
      const { joinQueries, joinSelectColumns } = this.getJoinDataToBuildQuery();
      selectedColumns = selectedColumns.concat(joinSelectColumns);
      joinStatements = joinQueries;
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
      resultQuery.push(this.buildWhereQuery());
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
  WhereQueryBuilder,
  JoinQueryBuilder,
  InsertQueryBuilder
]);

function queryBuilderFactory<T extends TablesDefinition<T>>(queryRunner: QueryRunner): QueryBuilder<T> {
  return new ProxyQueryBuilder(queryRunner);
}

export { queryBuilderFactory as qb };
