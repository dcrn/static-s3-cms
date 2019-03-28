<div id="fileSelector">
  <select on:change="setCurrent(this.value)">
  <option value="">Select a file...</option>
  {#each fileList as filename}
    <option value="{filename}">{filename}</option>
  {/each}
  </select>

  {#if hasChanges}
    <button on:click="saveCurrent()" class="btn btn-sm btn-primary">Save</button>
  {:else}
    <button class="btn btn-sm btn-secondary" disabled="disabled">Save</button>
  {/if}

  <span>{statusText}</span>
</div>
<div id="aceEditor"></div>


<style>
#fileSelector {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 40px;
  padding: 4px;
  background-color: #EEEEEE;
}
#fileSelector select {
  height: 32px;
  min-width: 200px;
}
#fileSelector button {
  height: 32px;
}
#aceEditor {
  position: absolute;
  bottom: 0px;
  top: 40px;
  left: 0px;
  right: 0px;
}
</style>

<script>
  export default {
    oncreate() {
      var editor = ace.edit("aceEditor");
      editor.setReadOnly(true);
      editor.on("change", e => {
        this.set({hasChanges: true});
      })
      this.set({editor, statusText: "Loading file list..."});

      this.listFiles(
        fileList => {
          this.set({fileList, statusText: ""});
        },
        "",
        ".html"
      );
    },
    data() {
      return {
        s3: null,
        bucketName: null,
        fileList: [],
        currentFilename: null,
        hasChanges: false,
        statusText: ""
      };
    },
    methods: {
      setCurrent(filename) {
        if (filename === "") {
          filename = null;
        }

        this.get().editor.setReadOnly(true);
        this.set({
          hasChanges: false,
          currentFilename: filename
        });

        if (filename !== null) {
          this.set({statusText: "Loading file..."});
          this.getFileContents(
            filename,
            contents => {
              this.get().editor.session.setMode("ace/mode/html");
              this.get().editor.session.setValue(contents);
              this.get().editor.setReadOnly(false);
              this.set({hasChanges: false, statusText: ""});
            }
          );
        } else {
          this.get().editor.session.setMode(null);
          this.get().editor.session.setValue("");
        }
      },
      saveCurrent() {
        const currentFilename = this.get().currentFilename;
        if (currentFilename !== null) {
          this.set({statusText: "Saving...", hasChanges: false});
          this.putFileContents(
            currentFilename,
            this.get().editor.getValue(),
            () => this.set({statusText: ""})
          );
        }
      },
      getFileContents(filename, callback) {
        var failure = err => this.onError(err);
        this.get().s3.getObject(
          {
            Bucket: this.get().bucketName,
            Key: filename
          },
          function (err, data) {
            if (err !== null) {
              failure(err);
            } else {
              callback(data.Body.toString("utf-8"));
            }
          }
        )
      },
      putFileContents(filename, data, callback) {
        var failure = err => this.onError(err);
        this.get().s3.putObject(
          {
            Bucket: this.get().bucketName,
            Key: filename,
            Body: data,
            ContentType: "text/html"
          },
          function (err, data) {
            if (err !== null) {
              failure(err);
            } else {
              callback();
            }
          }
        )
      },
      listFiles(callback, prefix, extension) {
        if (typeof prefix === "undefined") {
          prefix = "";
        }
        if (typeof extension === "undefined") {
          extension = "";
        }

        var failure = err => this.onError(err);
        this.get().s3.listObjectsV2(
          {
            Bucket: this.get().bucketName,
            Prefix: prefix
          },
          function (err, data) {
            if (err !== null) {
              failure(err);
            } else {
              callback(
                data.Contents.map(meta => meta.Key)
                  .filter(key => !key.endsWith("/"))
                  .filter(key => key.endsWith(extension))
                  .map(key => key.substring(prefix.length))
              );
            }
          }
        );
      },
      onError(err) {
        this.set({statusText: "Error: " + err});
        this.setCurrent("");
      }
    }
  }
</script>
