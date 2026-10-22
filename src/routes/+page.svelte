<script>
  import { goto } from "$app/navigation";

  let userCredential = $state("");
  let passCredential = $state("");

  function login() {
    if (userCredential === 'manager' && passCredential === 'password') {
      goto('/manager');
    } else if (userCredential === 'worker' && passCredential === 'password') {
      goto('/worker');
    }
  }
</script>


<main>
  <div class = "login-form">
    <h1>Login</h1>
    <div>
      <label for="username">Username:</label><br>
      <input bind:value={userCredential} type="text" id="username" name="username"><br><br>
    </div>
    <div>
      <label for="password">Password:</label><br>
      <input bind:value={passCredential} type="text" id="password" name="password"><br><br>
    </div>

    <!-- <input type="button" class = "button" value="Login">  -->
    <button onclick={login} class="button"> log in </button> <br>
  </div>

  <!-- temp navigation -->
  <a href="/worker">Go to worker dashboard</a> <br/>
  <a href="/manager">Go to manager dashboard</a>
  
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