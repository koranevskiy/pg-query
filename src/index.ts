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
    user_id: number
  };
}

const query = new QueryBuilder<Tables>({} as any).
     select('emails', ['email', 'reg_date', 'e_id'], 'e')
    .leftJoinAndSelect('users', ['lastname', 'name'], 'u')
    .whereToJoin({tableName: 'users', tableAlias: 'u'}, 'e.user_id = :user_id', {user_id: 1})
    .where('u.user_id <= :user_id', {user_id: 3})
    .orderBy({
      name: 'e.e_id',
    })
    .orderBy({
        name: 'e.email',
    })
    .limit(10)
    .offset(5)
    .rawQuery;

console.log(query)