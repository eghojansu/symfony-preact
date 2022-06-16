import { withContext } from '@app/context'

export default withContext(({
  ctx: {
    app,
  },
}) => (
  <div class="min-vh-100 d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="card">
        <div class="card-body">
          <h1 class="fs-3 border-bottom pb-3">{app.name}</h1>
          <p>Any thing could be happen. Face it!</p>
          <a class="btn btn-primary" href="/dashboard">
            <i class="bi-house"></i> Dashboard
          </a>
        </div>
      </div>
    </div>
  </div>
), null)