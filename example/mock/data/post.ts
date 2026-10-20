import { defineMockData } from 'vite-plugin-mock-dev-server'

export const initialPosts: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '310']

export default defineMockData('posts', initialPosts)
