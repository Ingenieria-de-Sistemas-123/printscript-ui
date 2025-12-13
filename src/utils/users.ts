import {Pagination} from "./pagination.ts";

export type PaginatedUsers = Pagination & {
    users: User[]
}

export type User = {
    name: string,
    id: string
}

export type Friends = {
  name: string,
  id: string,
  email: string
}
