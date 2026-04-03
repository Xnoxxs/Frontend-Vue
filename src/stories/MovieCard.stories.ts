import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MovieCard from '../components/MovieCard.vue'

const meta = {
  component: MovieCard,
  tags: ['autodocs'],
  args: {
    id: 1,
  },
  decorators: [
    (story) => ({
      components: { story },
      template:
        '<ul style="list-style: none; margin: 0; padding: 0; max-width: 280px; width: 100%; margin-inline: auto;"><story /></ul>',
    }),
  ],
} satisfies Meta<typeof MovieCard>

export default meta
type Story = StoryObj<typeof meta>

const demoPoster = 'https://picsum.photos/seed/moviecard-demo/342/513'

export const Default: Story = {
  args: {
    title: 'The Example Movie',
    posterPath: demoPoster,
    voteAverage: 7.2,
    releaseDate: '2024-03-15',
  },
}

export const HighRating: Story = {
  args: {
    title: "Critics' Choice",
    posterPath: 'https://picsum.photos/seed/moviecard-high/342/513',
    voteAverage: 9.4,
    releaseDate: '2023-11-22',
  },
}
