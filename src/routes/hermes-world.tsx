import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@/hooks/use-page-title'
import { NasTechWorldLanding } from '@/screens/playground/nastech-world-landing'

export const Route = createFileRoute('/nastech-world')({
  ssr: false,
  component: NasTechWorldRoute,
})

function NasTechWorldRoute() {
  usePageTitle('NasTechWorld — AI Agent RPG')
  return <NasTechWorldLanding />
}
