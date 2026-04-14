declare module 'sql-formatter' {
  export interface FormatOptions {
    language?:
      | 'sql'
      | 'mysql'
      | 'mariadb'
      | 'postgresql'
      | 'plsql'
      | 'redshift'
      | 'tsql'
      | 'bigquery'
      | 'db2'
      | 'db2i'
      | 'snowflake'
      | 'sqlite'
      | 'tidb'
      | 'trino'
      | 'presto'
      | 'hive'
      | 'spark'
      | 'n1ql'
      | 'singlestoredb'
      | 'transactsql'
    tabWidth?: number
    useTabs?: boolean
    keywordCase?: 'upper' | 'lower' | 'preserve'
    indentStyle?: 'standard' | 'tabularLeft' | 'tabularRight'
    logicalOperatorNewline?: 'before' | 'after'
    expressionWidth?: number
    linesBetweenQueries?: number
    denseOperators?: boolean
    newlineBeforeSemicolon?: boolean
  }

  export function format(sql: string, options?: FormatOptions): string
}
