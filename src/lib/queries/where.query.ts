import {QueryParams, SharedQueryBuilderMethod} from "src/lib/types/query-builder.types";


class WhereQueryBuilder extends SharedQueryBuilderMethod {
    protected isWhere = false;

    private whereStatements: string[] = [];

    public where(rawWhere: string, params?: QueryParams) {
        if (!this.isWhere) {
            this.isWhere = true;
        }
        const paramsSql = this.parametrizeStatement(rawWhere, params);
        this.whereStatements.push(paramsSql);
        return this;
    }

    protected buildWhereQuery(): string {
        if (this.isWhere) {
            return `WHERE ${this.whereStatements.join(' ')}`
        }
        return null;
    }
}


export { WhereQueryBuilder };