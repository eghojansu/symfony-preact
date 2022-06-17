// TODO: strip on production
import 'preact/debug'
import { render } from 'preact'
import { useEffect } from 'preact/hooks'
import AppProvider from './context'
import Pages from './pages'
import './main.sass'

render(<App />, document.getElementById('appx'))

function App() {
  useEffect(() => {
    document.getElementById('loadx')?.classList.add('d-none')
  }, [])

  return (
    <AppProvider>
      <Pages />
    </AppProvider>
  )
}