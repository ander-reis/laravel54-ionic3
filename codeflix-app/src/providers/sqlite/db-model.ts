import {Injectable} from '@angular/core';
import {DB} from "./db";
import objectValues from 'object.values';

/*
  Generated class for the DBModel provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export abstract class DBModel {

    protected abstract table;

    constructor(public db: DB) {
    }

    insert(params: Object): Promise<any> {
        let columns = Object.keys(params);
        columns.map((value) => {
            return `\`${value}\``;
        });
        let tokens = "?,".repeat(columns.length);
        tokens = tokens.substring(0, tokens.length - 1);
        let sql = `INSERT INTO \`${this.table}\` (${columns.join(',')}) VALUES (${tokens})`;
        console.log(sql);
        return this.db.executeSQL(sql, objectValues(params));
    }

    find(id): Promise<any>{
        let sql = `SELECT * FROM ${this.table} WHERE id = ?`;
        return this.db.executeSQL(sql, [id])
            .then(resultset => {
                return resultset.rows.length ? resultset.rows.item(0) : null;
            }).catch(e => console.log(e));
    }

    findByField(field, value){
        let sql = `SELECT * FROM ${this.table} WHERE \`${field}\` = ?`;
        return this.db.executeSQL(sql, [value]);
    }
}