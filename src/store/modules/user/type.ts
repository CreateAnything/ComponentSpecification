enum Role {
  Admin = 0,
  Mannger = 1
}
interface UserInfo {
  avatar: string
  username: string
  id: number
  role: Role
}

export type { Role, UserInfo }
