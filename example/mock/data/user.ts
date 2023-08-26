import mock from 'mockjs'
import { defineMockData } from 'vite-plugin-mock-dev-server'

interface User {
  account: string
  username: string
  age: number
}
export default defineMockData<Record<string, User>>('users', {
  mark2022: {
    account: mock.mock('@id()'),
    username: mock.mock('@first()'),
    age: 20,
  },
  john996: {
    account: 'john996',
    username: 'john',
    age: 20,
  },
  // mark2021: {
  //   account: mock.mock('@id()'),
  //   username: mock.mock('@first()'),
  //   age: 20,
  // },
  mark2020: {
    account: mock.mock('@id()'),
    username: mock.mock('@first()'),
    age: 20,
  },
})
