<script>

</script>


<main>
  <div class = "login-form">
    <h1>Login</h1>
    <div>
      <label for="Email">Email:</label><br>
      <input type="text" id="Email" name="Email"><br><br>
    </div>
    <div>
      <label for="password">Password:</label><br>
      <input type="text" id="password" name="password"><br><br>
    </div>

    <input type="button" class = "button" value="Login"> <br>
  </div>

  <!-- temp navigation -->
  <a href="/worker">Go to worker dashboard</a> <br/>
  <a href="/manager">Go to manager dashboard</a>
  <a href="/manager/roster">Go to manager roster</a>
</main>

<style>
  .login-form {
    max-width: 300px;
  margin: 0 auto;
  padding: 1rem;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;  
  }
  label {
    font-size: 1.5rem;
  }
  .button {
    font-family: sans-serif;
    font-size: 1.5rem;
    padding: 0.25rem;
    margin-bottom:0.5rem ;
  }
</style>