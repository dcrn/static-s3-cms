Hello world !
<br />
Templates:
<ul>
{#each pageList as page}
  <li on:click="selectPage(page)">{page}</li>
{/each}
</ul>

{#if selectedPage !== null}
  Page: {selectedPage}<br />
  Content: <br />
  <textarea bind:value=selectedContent></textarea><br />
  Template: <br />
  <textarea bind:value=selectedTemplate></textarea><br />
  <button on:click="savePage()">Save</button><br />
  <button on:click="selectPage(null)">Close</button><br />
{/if}

<script>
  var markdown = require("markdown").markdown;
  var mustache = require("mustache");

  const templateExt = ".mst";
  const contentExt = ".md";
  const outputExt = ".html";
  const templatePath = "template/";
  const contentPath = "content/";
  const outputPath = "";

  export default {
    oncreate() {
      this.getPageList(pageList => this.set({pageList}));
    },
    data() {
      return {
        s3: null,
        bucketName: null,
        pageList: [],
        selectedPage: null,
        selectedTemplate: "",
        selectedContent: ""
      };
    },
    methods: {
      selectPage(selectedPage) {
        this.set({
          selectedPage,
          selectedTemplate: "",
          selectedContent: ""
        });

        if (selectedPage !== null) {
          this.getFile(
            templatePath + selectedPage + templateExt,
            selectedTemplate => this.set({selectedTemplate}),
            ""
          );
          this.getFile(
            contentPath + selectedPage + contentExt,
            selectedContent => this.set({selectedContent}),
            ""
          );
        }
      },
      savePage() {
        const selectedPage = this.get().selectedPage;
        const selectedTemplate = this.get().selectedTemplate;
        const selectedContent = this.get().selectedContent;
        if (selectedPage !== null) {
          console.log("Saving file " + selectedPage);
          this.putFile(
            templatePath + selectedPage + templateExt,
            selectedTemplate
          );
          this.putFile(
            contentPath + selectedPage + contentExt,
            selectedContent
          );

          const output = mustache.render(
            selectedTemplate,
            {content: markdown.toHTML(selectedContent)}
          );

          this.putFile(
            outputPath + selectedPage + outputExt,
            output,
            "text/html"
          );
        }
      },
      getFile(filename, callback, defaultBody) {
        this.get().s3.getObject(
          {
            Bucket: this.get().bucketName,
            Key: filename
          },
          function (err, data) {
            if (err !== null) {
              if (err.code == "NoSuchKey") {
                callback(defaultBody);
                return;
              }

              console.log("getFile("+filename+") error: ");
              console.log(err);
            } else {
              callback(data.Body.toString("utf-8"));
            }
          }
        )
      },
      putFile(filename, data, contentType) {
        if (typeof contentType === undefined) {
          contentType = "text/plain";
        }

        this.get().s3.putObject(
          {
            Bucket: this.get().bucketName,
            Key: filename,
            Body: data,
            ContentType: contentType
          },
          function (err, data) {
            if (err !== null) {
              console.log("putFile("+filename+") error: ");
              console.log(err);
            }
          }
        )
      },
      getPageList(callback) {
        this.get().s3.listObjectsV2(
          {
            Bucket: this.get().bucketName,
            Prefix: templatePath
          },
          function (err, data) {
            if (err !== null) {
              console.log("S3:listObjects error: ");
              console.log(err);
            } else {
              callback(
                data.Contents
                  .map(meta => meta.Key)
                  .filter(key => key.endsWith(templateExt))
                  .map(key => key.substring(
                    templatePath.length,
                    key.length - templateExt.length
                  ))
              );
            }
          }
        );
      }
    }
  }
</script>
