import { withContext } from '@app/context'
import useTree from '@app/lib/tree'
import { Nav } from '@app/components/tree'
import Crud from '@app/components/crud'
import Form from '@app/components/form-auto'

export default withContext(() => {
  const endpoint = '/api/buku'
  const table = {
    columns: [
      {
        name: 'id',
        key: true,
      },
      {
        name: 'nama',
      },
      {
        name: 'harga',
      },
    ],
  }
  const getFormProps = ({
    close,
    refresh,
    setData,
    data: { item, url: action = endpoint } = {},
  }) => {
    const props = {
      action,
      controls: [
        {
          name: 'nama',
          minlength: 5,
          required: true,
          break: true,
        },
        {
          name: 'harga',
          required: true,
          break: true,
        },
      ],
      onCancel: () => close && close(),
      afterSuccess: ({ values, reset }) => {
        refresh()

        if (values.close && close) {
          close()
        } else if (item) {
          setData({ item: values })
        } else {
          reset()
        }
      },
    }

    if (item) {
      props.method = 'PUT'
      props.controls.forEach(prop => {
        const { name, value, type } = prop

        if (undefined === value && name in item) {
          prop.value = item[name]
        }

        if ('checkbox' === type && name in item) {
          prop.checked = prop.value == item[name]
        }
      })
    } else {
      props.controls.push({
        name: 'close',
        label: 'Close after saved',
        type: 'checkbox',
        value: '1',
        checked: true,
        break: true,
        extra: { ignore: true }
      })
    }

    return props
  }
  const renderContent = tab => {
    const { id, text } = tab

    if ('edit' === id) {
      return <EditPage tab={tab} formProps={getFormProps(tab)} />
    }

    if ('Create' === text) {
      return <CreatePage formProps={getFormProps(tab)} />
    }
  }

  return (
    <Crud
      title="Daftar Buku"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
})

const CreatePage = ({ formProps }) => {
  return (
    <Form {...formProps} />
  )
}

const EditPage = ({ formProps }) => {
  return (
    <Form {...formProps} />
  )
}