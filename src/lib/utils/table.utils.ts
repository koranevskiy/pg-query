import { escapeIdentifier } from 'pg';

function getSafeColumnName(columnName: string, tableName: string, tableAlias?: string): string {
  return tableAlias
    ? `${escapeIdentifier(tableAlias)}.${escapeIdentifier(columnName)}`
    : `${escapeIdentifier(tableName)}.${escapeIdentifier(columnName)}`;
}

function getSafeTableName(tableName: string, tableAlias?: string): string {
  return tableAlias ? `${escapeIdentifier(tableName)} as ${escapeIdentifier(tableAlias)}` : escapeIdentifier(tableName);
}

export { getSafeColumnName, getSafeTableName };
