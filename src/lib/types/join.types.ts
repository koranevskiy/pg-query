import {TableNames} from "src/lib/types/select.types";

type JoinType = 'left' | 'right' | 'inner' | 'full outer';

interface JoinStatement {
    type: JoinType
    tableAlias?: string
    tableName: string
    selectedColumns: string[]
    where: string[]
}

interface WhereToJoinTableIdentity<T> {
    tableName: TableNames<T>
    tableAlias?: string
}

export {
    JoinStatement,
    JoinType,
    WhereToJoinTableIdentity
}