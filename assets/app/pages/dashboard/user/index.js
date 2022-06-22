import { withContext } from '@app/context'
import useTree from '@app/lib/tree'
import { Nav } from '@app/components/tree'
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
    close,
    refresh,
    setData,
    data: { item, url: action = endpoint } = {},
  }) => {
    const props = {
      action,
      controls: [
        {
          name: 'id',
          label: 'User ID',
          minlength: 5,
          maxlength: 8,
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
        'data-ignore': true,
        break: true,
      })
    }

    return props
  }
  const renderContent = tab => {
    const { id, text } = tab

    if ('edit' === id) {
      return <EditPage formProps={getFormProps(tab)} />
    }

    if ('Create' === text) {
      return <CreatePage formProps={getFormProps(tab)} />
    }
  }

  return (
    <Crud
      title="Manage User"
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

const EditPage = ({ formProps: { action, ...formProps } }) => {
  const { items, activeId, setActive, handleTabSelect } = useTree([
    { text: 'Data' },
    { text: 'Access' },
  ], 'Access')

  return (
    <>
      <Nav items={items} activeId={activeId} onSelect={handleTabSelect} variant="tabs" />
      <div class="pt-3">
        {'Data' === activeId && <Form action={action} {...formProps} />}
        {'Access' === activeId && <Form {...{
          action: `${action}/access`,
          method: 'PATCH',
          controls: [
            {
              name: 'roles',
              choice: true,
              break: true,
              'data-source': '/api/data/roles',
            },
            {
              name: 'newPassword',
              label: 'Password',
              type: 'password',
              view: true,
              generate: true,
              break: true,
            },
          ],
          onCancel: () => setActive('Data'),
        }} />}
      </div>
    </>
  )
}