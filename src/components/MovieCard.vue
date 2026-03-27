<script setup lang="ts">
import '../css/MovieCard.css'
import { TMDB_IMAGE_BASE } from '../lib/api_client'

const props = defineProps<{
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate?: string
}>()

function resolvePosterSrc(posterPath: string | null): string | null {
  if (!posterPath) return null
  if (/^https?:\/\//i.test(posterPath)) return posterPath
  return `${TMDB_IMAGE_BASE}${posterPath}`
}
</script>

<template>
  <li>
    <RouterLink
      :to="`/movie/${props.id}`"
      class="movie-card"
      :aria-label="`View details for ${props.title}`"
    >
      <div class="movie-card__poster-wrap">
        <img
          v-if="props.posterPath"
          class="movie-card__poster"
          :src="resolvePosterSrc(props.posterPath) ?? ''"
          alt=""
        />
        <div
          v-else
          class="movie-card__poster movie-card__poster--placeholder"
          aria-hidden="true"
        />
      </div>
      <div class="movie-card__body">
        <h2 class="movie-card__title">{{ props.title }}</h2>
        <p class="movie-card__meta">
          {{ props.releaseDate ? props.releaseDate.slice(0, 4) : '—' }} · ★
          {{ props.voteAverage.toFixed(1) }}
        </p>
      </div>
    </RouterLink>
  </li>
</template>
