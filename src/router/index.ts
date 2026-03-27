import { createRouter, createWebHistory } from 'vue-router'
import MovieBrowse from '../pages/MovieBrowse.vue'
import MovieDetail from '../pages/MovieDetail.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'browse', component: MovieBrowse },
    { path: '/movie/:movieId', name: 'movie-detail', component: MovieDetail },
  ],
})
