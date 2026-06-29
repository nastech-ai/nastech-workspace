import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@/hooks/use-page-title'
import { NasTechWorldLanding } from '@/screens/playground/nastech-world-landing'

export const Route = createFileRoute('/world')({
  ssr: false,
  component: WorldRoute,
})

function WorldRoute() {
  usePageTitle('NasTechWorld — AI Agent RPG')
  return <NasTechWorldLanding />
}
