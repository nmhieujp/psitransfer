<template lang="pug">
  div.upload-files
    .panel.panel-default.files-card(:class="{'panel-primary': !disabled, 'is-empty': files.length === 0}")
      .panel-heading(v-show="files.length > 0")
        strong {{ $root.lang.files }}
        span.file-total(v-show="bucketSize > 0") {{ humanFileSize(bucketSize) }}
      .panel-body
        .dropzone(
          :class="{disabled: disabled}",
          v-show="files.length === 0",
          tabindex="0",
          role="button",
          @click="triggerFileInput()",
          @keydown.enter.prevent="triggerFileInput()",
          @keydown.space.prevent="triggerFileInput()"
        )
          span.dropzone-icon(aria-hidden="true")
            icon(name="cloud-upload-alt", scale="2.6")
          p.dropzone-title {{ $root.lang.dropFilesHere }}
          p.dropzone-hint {{ $root.lang.dropHint }}
          span.dropzone-browse {{ $root.lang.chooseFiles }}
        table.table.table-striped(v-show="files.length > 0")
          tbody
            tr(v-for="file in files")
              td.file-icon
                file-icon(:file="file._File")
              td
                p.file-name
                  strong  {{ file.name }}
                  small  ({{ file.humanSize }})
                p
                  input.form-control.input-sm(type="text", :placeholder="$root.lang.comment", v-model="file.comment", :disabled="disabled")
                .alert.alert-danger(v-if="file.error")
                  icon.fa-fw(name="exclamation-triangle")
                  |  {{ file.error }}
                .progress(v-show="!file.error && (state === 'uploading' || state === 'uploaded')")
                  .progress-bar.progress-bar-success.progress-bar-striped(:style="{width: file.progress.percentage+'%'}", :class="{active:!file.uploaded}")
              td.btns
                a(
                  @click="$store.dispatch('upload/removeFile', file)",
                  @keydown.enter.prevent="$store.dispatch('upload/removeFile', file)",
                  @keydown.space.prevent="$store.dispatch('upload/removeFile', file)",
                  v-show="!disabled || bucketSizeError",
                  tabindex="0",
                  role="button",
                  :title="$root.lang.removeFile",
                  :aria-label="$root.lang.removeFile"
                )
                  icon(name="times")

        input#fileInput(type="file", @change="$store.dispatch('upload/addFiles', $event.target.files)", multiple="", :disabled="disabled", style="display: none")
        .add-more(v-show="files.length>0")
          a.btn.btn-default.btn-sm(
            @click="triggerFileInput()",
            @keydown.enter.prevent="triggerFileInput()",
            @keydown.space.prevent="triggerFileInput()",
            :disabled="disabled",
            tabindex="0",
            role="button"
          )
            icon(name="plus-circle")
            span  {{ $root.lang.addFiles }}
</template>


<script type="text/babel">
  import dragDrop from 'drag-drop';
  import 'vue-awesome/icons/exclamation-triangle'
  import 'vue-awesome/icons/plus'
  import 'vue-awesome/icons/plus-circle'
  import 'vue-awesome/icons/times'
  import 'vue-awesome/icons/cloud-upload-alt'
  import { mapGetters, mapState } from 'vuex';
  import FileIcon from '../common/FileIcon.vue';
  import { humanFileSize } from "./store/upload";

  export default {
    name: 'Files',

    components: { FileIcon },

    computed: {
      ...mapState('upload', ['files']),
      ...mapState(['state',]),
      ...mapGetters('upload', ['bucketSize', 'bucketSizeError']),
      ...mapGetters(['disabled']),
    },

    mounted() {
      // init drop files support on <body>
      this.dragDropCleanup = dragDrop('body', files => this.$store.dispatch('upload/addFiles', files));
    },

    watch: {
      state: function(state) {
        if(state === 'uploading') {
          this.dragDropCleanup();
        }
      }
    },

    methods: {
      humanFileSize,
      triggerFileInput() {
        if (this.disabled) return;
        const input = document.getElementById('fileInput');
        if (input) input.click();
      },
    }
  };
</script>
