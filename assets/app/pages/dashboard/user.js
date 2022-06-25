import { withGranted } from '@app/context'
import useTree from '@app/lib/tree'
import { NavTab } from '@app/components/tree'
import Crud, { CrudForm } from '@app/components/crud'
import Form from '@app/components/form-auto'

export default withGranted(MainPage)

function MainPage() {
  return (
    <Crud
      title="Manage User"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
}

const endpoint = '/api/user'
const formProps = {
  endpoint,
  controls: [
    {
      name: 'id',
      label: 'User ID',
      minlength: 5,
      maxlength: 8,
      required: true,
      once: true,
    },
    {
      name: 'name',
      required: true,
      maxlength: 32,
    },
    {
      name: 'active',
      type: 'checkbox',
      value: '1',
      break: true,
    },
    {
      name: 'email',
      type: 'email',
    },
  ],
}
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

const renderContent = tab => (
  ('edit' === tab?.id && <EditPage tab={tab} />)
  || ('create' === tab?.id && <CreatePage tab={tab} />)
  || null
)

const CreatePage = ({ tab }) => {
  return (
    <CrudForm tab={tab} {...formProps} />
  )
}

const EditPage = ({ tab }) => {
  const { data: { item, url: action } } = tab
  const { items, activeId, setActive, handleTabSelect } = useTree(tree => {
    tree.add('Data')
    tree.add('Access')
  })

  return (
    <>
      <NavTab items={items} activeId={activeId} onSelect={handleTabSelect} />
      <div class="pt-3">
        {
          ('Data' === activeId && (<CrudForm tab={tab} {...formProps} />))
          || (
            'Access' === activeId && (
              <AccessForm
                item={item}
                action={`${action}/access`}
                onCancel={() => setActive('Data')} />
            )
          )
          || null
        }
      </div>
    </>
  )
}

const AccessForm = ({
  item,
  ...formProps
}) => (
  <Form {...{
    initials: item,
    method: 'PATCH',
    controls: [
      {
        name: 'roles',
        type: 'choice',
        multiple: true,
        source: '/api/data/roles',
      },
      {
        name: 'newPassword',
        label: 'Password',
        type: 'password',
        view: true,
        generate: true,
      },
    ],
    ...formProps,
  }} />
)