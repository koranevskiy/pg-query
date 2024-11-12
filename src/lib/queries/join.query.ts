import { QueryParams, SharedQueryBuilderMethod, TablesDefinition } from 'src/lib/types/query-builder.types';
import { JoinStatement, JoinType, WhereToJoinTableIdentity } from 'src/lib/types/join.types';
import { getSafeColumnName, getSafeTableName } from 'src/lib/utils/table.utils';
import { ColumnsNames, TableNames } from 'src/lib/types/select.types';

class JoinQueryBuilder<T extends TablesDefinition<T>> extends SharedQueryBuilderMethod {
  protected isJoined = false;

  private joinStatements: JoinStatement[] = [];

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

  public getJoinDataToBuildQuery(): { joinQueries: string[]; joinSelectColumns: string[] } {
    if (!this.isJoined) {
      return null;
    }
    const joinQueries: string[] = [];
    const joinSelectColumns: string[] = [];

    for (const statement of this.joinStatements) {
      joinSelectColumns.push(statement.selectedColumns.join(','));
      const joinStatement = `${statement.type} JOIN ${statement.tableName} ON ${statement.where.join(' ')}`;
      joinQueries.push(joinStatement);
    }

    return {
      joinQueries,
      joinSelectColumns,
    };
  }
}

export { JoinQueryBuilder };
