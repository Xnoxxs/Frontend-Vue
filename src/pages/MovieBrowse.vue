<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import '../css/MovieBrowse.css'
import MovieCard from '../components/MovieCard.vue'
import { useDebouncedRef } from '../composables/useDebouncedRef'
import {
  fetchMovieGenres,
  fetchPopularMovies,
  searchMovies,
  type Genre,
  type Movie,
} from '../lib/api_client'

const SEARCH_DEBOUNCE_MS = 400

type SortOption = 'popularity' | 'rating' | 'release_date'

export type MovieBrowseStorybookDemo = {
  movies: Movie[]
  genres?: Genre[]
}

const props = defineProps<{
  /** Static data for Storybook (skips API and API key banner). */
  storybookDemo?: MovieBrowseStorybookDemo
}>()

const apiKey = computed(() => (import.meta.env.VITE_TMDB_API_KEY ?? '').trim())
const hasApiKey = computed(
  () => apiKey.value.length > 0 || Boolean(props.storybookDemo),
)

const movies = ref<Movie[]>(
  props.storybookDemo
    ? props.storybookDemo.movies.map((m) => ({
        ...m,
        genre_ids: m.genre_ids ?? [],
      }))
    : [],
)
const genres = ref<Genre[]>(props.storybookDemo?.genres ?? [])
const searchInput = ref('')
const debouncedSearch = useDebouncedRef(searchInput, SEARCH_DEBOUNCE_MS)

const genreId = ref('all')
const minRating = ref('0')
const sortBy = ref<SortOption>('popularity')

const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => [apiKey.value, props.storybookDemo] as const,
  ([key, demo]) => {
    if (demo) return
    if (!key) return
    void fetchMovieGenres(key)
      .then((g) => {
        genres.value = g
      })
      .catch(() => {
        genres.value = []
      })
  },
  { immediate: true },
)

watch(
  () => [apiKey.value, debouncedSearch.value, props.storybookDemo] as const,
  ([key, debounced, demo], _old, onCleanup) => {
    if (demo) {
      movies.value = demo.movies.map((m) => ({
        ...m,
        genre_ids: m.genre_ids ?? [],
      }))
      genres.value = demo.genres ?? []
      loading.value = false
      error.value = null
      return
    }
    if (!key) return
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    void Promise.resolve().then(() => {
      if (cancelled) return
      loading.value = true
      error.value = null
      const q = debounced.trim()
      const promise = q === '' ? fetchPopularMovies(key) : searchMovies(key, q)
      void promise
        .then((results) => {
          if (!cancelled) {
            movies.value = results.map((m) => ({
              ...m,
              genre_ids: m.genre_ids ?? [],
            }))
          }
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            error.value =
              e instanceof Error ? e.message : 'Something went wrong'
            movies.value = []
          }
        })
        .finally(() => {
          if (!cancelled) {
            loading.value = false
          }
        })
    })
  },
  { immediate: true },
)

const displayedMovies = computed(() => {
  let list = [...movies.value]

  const gid = genreId.value === 'all' ? null : Number(genreId.value)
  if (gid !== null && !Number.isNaN(gid)) {
    list = list.filter((m) => (m.genre_ids ?? []).includes(gid))
  }

  const min = Number(minRating.value)
  if (!Number.isNaN(min) && min > 0) {
    list = list.filter((m) => m.vote_average >= min)
  }

  const sorted = [...list]
  switch (sortBy.value) {
    case 'rating':
      sorted.sort((a, b) => b.vote_average - a.vote_average)
      break
    case 'release_date':
      sorted.sort((a, b) => {
        const da = a.release_date || ''
        const db = b.release_date || ''
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return db.localeCompare(da)
      })
      break
    case 'popularity':
    default:
      sorted.sort((a, b) => b.popularity - a.popularity)
  }
  return sorted
})
</script>

<template>
  <div class="movie-app">
    <p v-if="!hasApiKey" class="movie-app__banner" role="status">
      Add <code>VITE_TMDB_API_KEY</code> to a <code>.env</code> file in the
      project root (same folder as <code>package.json</code>), then restart
      <code>npm run dev</code>. Until then, search and filters are disabled.
    </p>
    <header class="movie-app__header">
      <h1>Movie Explorer</h1>
      <div class="movie-app__toolbar">
        <label class="movie-app__field">
          <span class="movie-app__label">Search</span>
          <input
            v-model="searchInput"
            type="search"
            class="movie-app__input"
            placeholder="Search movies…"
            autocomplete="off"
            :disabled="!hasApiKey"
          />
        </label>
        <label class="movie-app__field">
          <span class="movie-app__label">Genre</span>
          <select
            v-model="genreId"
            class="movie-app__select"
            :disabled="!hasApiKey"
          >
            <option value="all">All genres</option>
            <option v-for="g in genres" :key="g.id" :value="String(g.id)">
              {{ g.name }}
            </option>
          </select>
        </label>
        <label class="movie-app__field">
          <span class="movie-app__label">Min rating</span>
          <select
            v-model="minRating"
            class="movie-app__select"
            :disabled="!hasApiKey"
          >
            <option value="0">Any</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
          </select>
        </label>
        <label class="movie-app__field">
          <span class="movie-app__label">Sort</span>
          <select
            v-model="sortBy"
            class="movie-app__select"
            :disabled="!hasApiKey"
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release date</option>
          </select>
        </label>
      </div>
    </header>

    <p v-if="hasApiKey && loading" class="movie-app__status">Loading…</p>
    <p v-if="hasApiKey && error" class="movie-app__error">{{ error }}</p>

    <p
      v-if="hasApiKey && !loading && !error && displayedMovies.length === 0"
      class="movie-app__empty"
    >
      No movies match your filters.
    </p>

    <p v-if="!hasApiKey" class="movie-app__empty">
      Movies will load here after you add your API key and restart the dev
      server.
    </p>

    <ul class="movie-grid">
      <MovieCard
        v-for="movie in displayedMovies"
        :id="movie.id"
        :key="movie.id"
        :title="movie.title"
        :poster-path="movie.poster_path"
        :vote-average="movie.vote_average"
        :release-date="movie.release_date"
      />
    </ul>
  </div>
</template>
