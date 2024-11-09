import { QueryBuilder } from 'src/lib/query-builder';

interface Tables {
  users: {
    id: number;
    name: string;
    lastname: string;
  };
  emails: {
    e_id: number;
    email: string;
    reg_date: Date;
  };
}

const query = new QueryBuilder<Tables>({} as any).select('emails', ['email'], 'em')
    .select('users', ['name'], 'u').rawQuery;

console.log(query)