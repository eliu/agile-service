export interface User {
  email: string
  enabled?: boolean
  id: number
  imageUrl: string | null
  ldap: boolean
  loginName: string
  realName: string
}

export interface Issue {
  issueId: string
  summary: string
}

export interface PI {
  code: string
  name: string
}

export interface IStatus {
  id: string
  valueCode: 'todo' | 'doing' | 'done' | 'prepare'
  name: string
}
export interface Priority {
  colour: string,
  default: boolean
  description: string,
  enable: boolean,
  id: string,
  name: string,
}
