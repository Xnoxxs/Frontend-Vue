<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../css/MovieDetail.css'
import {
  TMDB_BACKDROP_BASE,
  TMDB_POSTER_LARGE,
  fetchMovieDetails,
  type MovieDetails,
} from '../lib/api_client'

function formatUsd(n: number): string {
  if (n <= 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatRuntime(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function resolveTmdbImage(base: string, path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${base}${path}`
}

const props = defineProps<{
  /** Static data for Storybook (skips API and API key banner). */
  storybookDemo?: MovieDetails
}>()

const route = useRoute()

const movieIdParam = computed(() => {
  const p = route.params.movieId
  return Array.isArray(p) ? p[0] : p
})

const id = computed(() => {
  const mid = movieIdParam.value
  return mid ? Number.parseInt(mid, 10) : Number.NaN
})

const apiKey = computed(() => (import.meta.env.VITE_TMDB_API_KEY ?? '').trim())
const hasApiKey = computed(
  () => apiKey.value.length > 0 || Boolean(props.storybookDemo),
)

const movie = ref<MovieDetails | null>(props.storybookDemo ?? null)
const loading = ref(!props.storybookDemo && apiKey.value.length > 0)
const error = ref<string | null>(null)

watch(
  () => ({
    key: apiKey.value,
    movieId: id.value,
    hasKey: hasApiKey.value,
    demo: props.storybookDemo,
  }),
  ({ key, movieId, hasKey, demo }, _old, onCleanup) => {
    if (demo) {
      movie.value = demo
      loading.value = false
      error.value = null
      return
    }
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    void Promise.resolve().then(() => {
      if (cancelled) return
      if (!hasKey) {
        loading.value = false
        return
      }
      if (Number.isNaN(movieId) || movieId <= 0) {
        loading.value = false
        error.value = 'Invalid movie ID.'
        movie.value = null
        return
      }
      loading.value = true
      error.value = null
      void fetchMovieDetails(key, movieId)
        .then((data) => {
          if (!cancelled) movie.value = data
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            error.value =
              e instanceof Error ? e.message : 'Could not load movie.'
            movie.value = null
          }
        })
        .finally(() => {
          if (!cancelled) loading.value = false
        })
    })
  },
  { immediate: true },
)

const backdropUrl = computed(() =>
  movie.value
    ? resolveTmdbImage(TMDB_BACKDROP_BASE, movie.value.backdrop_path)
    : null,
)

const posterUrl = computed(() =>
  movie.value
    ? resolveTmdbImage(TMDB_POSTER_LARGE, movie.value.poster_path)
    : null,
)

const heroStyle = computed(() => {
  const url = backdropUrl.value
  if (!url) return undefined
  return {
    backgroundImage: `linear-gradient(
                  to bottom,
                  rgba(6, 7, 10, 0.88) 0%,
                  rgba(6, 7, 10, 0.72) 38%,
                  rgba(6, 7, 10, 0.5) 62%,
                  var(--bg) 100%
                ), url(${url})`,
  }
})
</script>

<template>
  <div v-if="!hasApiKey" class="movie-detail movie-detail--notice">
    <RouterLink to="/" class="movie-detail__back">
      ← Back to browse
    </RouterLink>
    <p class="movie-app__banner" role="status">
      Add <code>VITE_TMDB_API_KEY</code> to <code>.env</code> and restart the
      dev server.
    </p>
  </div>

  <div v-else-if="loading" class="movie-detail movie-detail--notice">
    <RouterLink to="/" class="movie-detail__back">
      ← Back to browse
    </RouterLink>
    <p class="movie-app__status">Loading…</p>
  </div>

  <div v-else-if="error || !movie" class="movie-detail movie-detail--notice">
    <RouterLink to="/" class="movie-detail__back">
      ← Back to browse
    </RouterLink>
    <p class="movie-app__error">{{ error ?? 'Movie not found.' }}</p>
  </div>

  <article v-else class="movie-detail">
    <div
      class="movie-detail__hero"
      :class="{ 'movie-detail__hero--backdrop': backdropUrl }"
      :style="heroStyle"
    >
      <div class="movie-detail__hero-inner">
        <RouterLink
          to="/"
          class="movie-detail__back movie-detail__back--on-hero"
        >
          ← Back to browse
        </RouterLink>
        <div class="movie-detail__layout">
          <div class="movie-detail__poster-col">
            <img
              v-if="posterUrl"
              class="movie-detail__poster"
              :src="posterUrl"
              :alt="`${movie.title} poster`"
            />
            <div
              v-else
              class="movie-detail__poster movie-detail__poster--placeholder"
              aria-hidden="true"
            />
          </div>
          <div class="movie-detail__main">
            <h1 class="movie-detail__title">{{ movie.title }}</h1>
            <p
              v-if="movie.original_title !== movie.title"
              class="movie-detail__original"
            >
              Original title: {{ movie.original_title }}
            </p>
            <p v-if="movie.tagline" class="movie-detail__tagline">
              {{ movie.tagline }}
            </p>

            <dl class="movie-detail__stats">
              <div class="movie-detail__stat">
                <dt>Rating</dt>
                <dd>
                  ★ {{ movie.vote_average.toFixed(1) }}
                  <span class="movie-detail__muted">
                    ({{ movie.vote_count.toLocaleString() }} votes)
                  </span>
                </dd>
              </div>
              <div class="movie-detail__stat">
                <dt>Released</dt>
                <dd>{{ movie.release_date || '—' }}</dd>
              </div>
              <div class="movie-detail__stat">
                <dt>Runtime</dt>
                <dd>{{ formatRuntime(movie.runtime) }}</dd>
              </div>
              <div class="movie-detail__stat">
                <dt>Status</dt>
                <dd>{{ movie.status || '—' }}</dd>
              </div>
            </dl>

            <ul v-if="movie.genres.length > 0" class="movie-detail__genres">
              <li v-for="g in movie.genres" :key="g.id">{{ g.name }}</li>
            </ul>

            <section v-if="movie.overview" class="movie-detail__section">
              <h2 class="movie-detail__section-title">Overview</h2>
              <p class="movie-detail__overview">{{ movie.overview }}</p>
            </section>
          </div>
        </div>
      </div>
    </div>

    <div class="movie-detail__meta-grid-wrap">
      <h2 class="movie-detail__section-title movie-detail__section-title--grid">
        Details
      </h2>
      <dl class="movie-detail__meta-grid">
        <div>
          <dt>Original language</dt>
          <dd>{{ movie.original_language.toUpperCase() }}</dd>
        </div>
        <div>
          <dt>Popularity</dt>
          <dd>{{ movie.popularity.toFixed(1) }}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{{ formatUsd(movie.budget) }}</dd>
        </div>
        <div>
          <dt>Revenue</dt>
          <dd>{{ formatUsd(movie.revenue) }}</dd>
        </div>
        <div v-if="movie.homepage" class="movie-detail__meta-span">
          <dt>Homepage</dt>
          <dd>
            <a
              :href="movie.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="movie-detail__link"
            >
              {{ movie.homepage }}
            </a>
          </dd>
        </div>
        <div v-if="movie.imdb_id">
          <dt>IMDb</dt>
          <dd>
            <a
              :href="`https://www.imdb.com/title/${movie.imdb_id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="movie-detail__link"
            >
              {{ movie.imdb_id }}
            </a>
          </dd>
        </div>
      </dl>

      <section
        v-if="movie.production_countries.length > 0"
        class="movie-detail__subsection"
      >
        <h3 class="movie-detail__subsection-title">Countries</h3>
        <p class="movie-detail__inline-list">
          {{ movie.production_countries.map((c) => c.name).join(', ') }}
        </p>
      </section>

      <section
        v-if="movie.spoken_languages.length > 0"
        class="movie-detail__subsection"
      >
        <h3 class="movie-detail__subsection-title">Languages</h3>
        <p class="movie-detail__inline-list">
          {{ movie.spoken_languages.map((l) => l.english_name).join(', ') }}
        </p>
      </section>

      <section
        v-if="movie.production_companies.length > 0"
        class="movie-detail__subsection"
      >
        <h3 class="movie-detail__subsection-title">Production companies</h3>
        <ul class="movie-detail__companies">
          <li v-for="c in movie.production_companies" :key="c.id">
            {{ c.name }}
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
