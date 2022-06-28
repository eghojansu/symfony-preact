import { useFormAuto } from '../lib/form'
import Form from './form'

export default FormAuto

function FormAuto(props) {
  const form = useFormAuto(props)

  return (<Form {...form} />)
}