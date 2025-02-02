import { qb } from 'src/lib/query-builder';

interface Tables {
  users: {
    id: number;
    name: string;
    lastname?: string;
  };
  emails: {
    e_id: number;
    email: string;
    reg_date: Date;
    user_id: number
  };
}

const query = qb<Tables>({} as any).
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

const queryInsert = qb<Tables>({} as any).insert('users', [{ name: 'a', id: 2 }, {name: 'zxc', id: {
    sql: 'id + :p_zxc',
    params: {p_zxc: 300}
    }}]).rawQuery;

console.log(queryInsert);