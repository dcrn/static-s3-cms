<div class="login-container">
  {#if errorMessage != null}
  <div class="alert alert-danger" role="alert">
    <strong>Error: </strong>{errorMessage}
  </div>
  {/if}
  <form class="login-form">
    <fieldset disabled="{formStatus}">
      <label>Access Key ID</label>
      <input bind:value="accessKeyId" class="form-control" type="username" />
      <label>Secret Access Key</label>
      <input bind:value="secretAccessKey" class="form-control" type="password" />
      <label>Bucket Name</label>
      <input bind:value="bucketName" class="form-control" type="text" />
      <label>Region</label>
      <select bind:value="region" class="form-control">
        ​<option value="us-east-2">US East (Ohio)</option>
        ​<option value="us-east-1">US East (N. Virginia)</option>
        ​<option value="us-west-1">US West (N. California)</option>
        ​<option value="us-west-2">US West (Oregon)</option>
        ​<option value="ca-central-1">Canada (Central)</option>
        ​<option value="ap-south-1">Asia Pacific (Mumbai)</option>
        ​<option value="ap-northeast-2">Asia Pacific (Seoul)</option>
        ​<option value="ap-northeast-3">Asia Pacific (Osaka-Local) ***</option>
        ​<option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
        <option value="cn-north-1">China (Beijing)</option>
        <option value="cn-northwest-1">China (Ningxia)</option>
        <option value="eu-central-1">EU (Frankfurt)</option>
        <option value="eu-west-1">EU (Ireland)</option>
        <option value="eu-west-2">EU (London)</option>
        <option value="eu-west-3">EU (Paris)</option>
        <option value="sa-east-1">South America (São Paulo)</option>
      </select>
      <button class="btn btn-lg btn-primary btn-block" on:click="doLogin(event)">Log in</button>
    </fieldset>
  </form>
</div>

<style>
  .login-container {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 400px;
    margin-top: 5%;
    margin-bottom: 5%;
    background-color: #f6f6f6;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
      padding: 15px;
  }

  .login-form input {
    box-sizing: border-box;
    width: 100%;
  }

  .form-control {
    margin-bottom: 10px;
  }
</style>

<script>
  var AwsS3 = require('aws-sdk/clients/s3');
  import defaults from '../defaults.json';

  export default {
    data() {
      return {
        s3: null,
        loggingIn: false,
        region: defaults.region,
        accessKeyId: defaults.accessKeyId,
        secretAccessKey: defaults.secretAccessKey,
        bucketName: defaults.bucketName,
      }
    },
    computed: {
      formStatus: ({loggingIn}) => loggingIn ? "disabled" : ""
    },
    methods: {
      doLogin(event) {
        var self = this;
        event.preventDefault();
        self.set({
          loggingIn: true,
          errorMessage: null
        });

        var s3 = new AwsS3({
          accessKeyId: self.get().accessKeyId,
          secretAccessKey: self.get().secretAccessKey,
          region: self.get().region,
        });

        s3.headBucket(
          {Bucket: self.get().bucketName},
          function (err, data) {
            if (err) {
              console.log("headBucket error occurred");
              console.log(err);
              self.set({
                loggingIn: false,
                errorMessage: err.message
              });
              return;
            }

            document.title = "Editing " + self.get().bucketName;
            self.set({errorMessage: null, s3});
          }
        );
      }
    }
  }
</script>
