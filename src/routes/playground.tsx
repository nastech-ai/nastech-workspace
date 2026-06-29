import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@/hooks/use-page-title'
import { NasTechWorldEmbed } from '@/screens/playground/nastech-world-embed'

export const Route = createFileRoute('/playground')({
  ssr: false,
  component: PlaygroundRoute,
})

function PlaygroundRoute() {
  usePageTitle('NasTechWorld')
  return <NasTechWorldEmbed />
}
