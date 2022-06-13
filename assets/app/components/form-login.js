export default () => {
  return (
    <div class="min-vh-100 d-flex justify-content-center align-items-center">
      <form method="POST" class="form-signin">
        <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

        <div class="form-floating">
          <input type="text" class="form-control form-start" id="input-account" placeholder="Username or email" />
          <label for="input-account">Username or email</label>
        </div>
        <div class="form-floating">
          <input type="password" class="form-control form-end" id="input-password" placeholder="Password" />
          <label for="input-password">Password</label>
        </div>

        <div class="checkbox mb-3">
          <label>
            <input type="checkbox" value="remember-me" /> Remember me
          </label>
        </div>
        <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        <p class="mt-5 mb-3 text-muted">&copy; 2017–2022</p>
      </form>
    </div>
  )
}