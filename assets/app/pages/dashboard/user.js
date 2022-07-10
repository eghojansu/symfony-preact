import { withGranted } from '@app/context'
import useTree from '@app/lib/tree'
import { NavTab } from '@app/components/tree'
import Crud, { renderCrudContent } from '@app/components/crud'
import Form from '@app/components/form-auto'

export default withGranted(MainPage)

function MainPage() {
  return (
    <Crud
      title="Manage User"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table}
      form={form} />
  )
}

const endpoint = '/api/user'
const form = {
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
  access: true,
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
  ('edit' === tab?.tag && <EditPage tab={tab} />)
  || null
)

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
          ('data' === activeId && renderCrudContent(tab, endpoint, form))
          || (
            'access' === activeId && (
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