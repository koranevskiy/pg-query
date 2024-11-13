interface QueryRunner {
  query<ResultRow>(query: string, params?: any[]): Promise<ResultRow>;
}

type TablesDefinition<T> = T extends { [key: string]: any } ? T : never;

type QueryParams = Record<string, any>;

/**
 * Need to hint the tsc that query classes have shared methods as they will be emitted in runtime by call applyMixinsAndInstanate
 */
abstract class SharedQueryBuilderMethod {
  protected tableAlias: Record<string, string> = {};

  protected params: any[] = [];
  protected paramNum = 1;

  protected parametrizeStatement?(rawSql: string, params?: QueryParams): string {
    return;
  }

  protected registerTableAlias(tableName: string, tableAlias: string): void {
    return;
  }
}

export { QueryRunner, TablesDefinition, QueryParams, SharedQueryBuilderMethod };
