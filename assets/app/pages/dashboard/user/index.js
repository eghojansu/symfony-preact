import { withContext } from '@app/context'
import Crud from '@app/components/crud'
import Form from '@app/components/form-auto'

export default withContext(({
}) => {
  const endpoint = '/api/user'
  const table = {
    columns: [
      {
        name: 'id',
        text: 'User ID',
        key: true,
      },
      {
        name: 'name',
      },
      {
        name: 'active',
      },
    ],
  }
  const getFormProps = ({
    text,
    close,
    refresh,
    data: { url: action = endpoint } = {},
  }) => {
    const props = {
      action,
      controls: [
        {
          name: 'id',
          label: 'User ID',
          minlength: 5,
          required: true,
          break: true,
        },
        {
          name: 'name',
          required: true,
          break: true,
        },
        {
          name: 'email',
          type: 'email',
          break: true,
        },
        {
          name: 'active',
          type: 'checkbox',
          value: '1',
          break: true,
        },
      ],
      actionCancel: {
        url: null,
        text: 'Cancel',
        icon: 'x-circle',
        onClick: () => close && close(),
      },
      afterSuccess: ({ values, reset }) => {
        refresh()

        if (values.close && close) {
          close()
        } else {
          reset()
        }
      },
    }

    if ('Create' === text) {
      props.controls.push({
        name: 'close',
        label: 'Close after saved',
        type: 'checkbox',
        value: '1',
        checked: true,
        'data-ignore': true,
        break: true,
      })
    }

    return props
  }
  const renderContent = tab => {
    const { id, text } = tab

    if ('edit' === id) {
      return <Form {...getFormProps(tab)} />
    }

    if ('Create' === text) {
      return <Form {...getFormProps(tab)} />
    }

    return <div>Content</div>
  }

  return (
    <Crud
      title="Manage User"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
})