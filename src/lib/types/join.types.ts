
interface JoinStatement {
    tableAlias?: string
    tableName: string
    selectedColumns: string[]
}

export {
    JoinStatement,
}