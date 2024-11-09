interface QueryRunner {
  query<ResultRow>(query: string, params?: any[]): Promise<ResultRow>;
}

type TablesDefinition<T> = T extends { [key: string]: any } ? T : never;

export { QueryRunner, TablesDefinition };
