interface User {
  account: string
  username: string
  age: number
}
export default {
  mark2022: {
    account: 'mark2022',
    username: 'mark',
    age: 20,
  },
  john996: {
    account: 'john996',
    username: 'john',
    age: 20,
  },
} as Record<string, User>
