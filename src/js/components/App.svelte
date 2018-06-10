<svelte:component this="{s3 === null ? Login : Dashboard}" bind:s3 bind:bucketName />

<script>
  import Login from './Login.svelte';
  import Dashboard from './Dashboard.svelte';
  import defaults from '../defaults.json';

  export default {
    data() {
      return {
        Login,
        Dashboard,
        s3: null,
        bucketName: defaults.bucketName
      }
    }
  }
</script>
