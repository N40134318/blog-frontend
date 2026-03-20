<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '~/composables/useMarkdown'

const title = ref('')
const content = ref('')
const category = ref('')
const tags = ref('')
const coverImage = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const uploadMessage = ref('')
const uploading = ref(false)
const submitting = ref(false)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')

const api = useApi()

const editorRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)

const syncPreviewScroll = () => {
  const editor = editorRef.value
  const preview = previewRef.value

  if (!editor || !preview) return

  const editorScrollRange = editor.scrollHeight - editor.clientHeight
  const previewScrollRange = preview.scrollHeight - preview.clientHeight

  if (editorScrollRange <= 0 || previewScrollRange <= 0) {
    preview.scrollTop = 0
    return
  }

  const scrollRatio = editor.scrollTop / editorScrollRange
  preview.scrollTop = scrollRatio * previewScrollRange
}

const previewHtml = computed(() => {
  return renderMarkdown(content.value)
})

const selectFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  selectedFile.value = file
  selectedFileName.value = file ? file.name : ''
  uploadMessage.value = ''
  errorMessage.value = ''
}

const uploadSelectedFile = async () => {
  if (!selectedFile.value) {
    errorMessage.value = '请先选择图片'
    return
  }

  try {
    uploading.value = true
    errorMessage.value = ''
    uploadMessage.value = ''

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const data = await api<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    coverImage.value = data.url
    uploadMessage.value = '封面上传成功'
  } catch (error: any) {
    errorMessage.value = error?.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

const submit = async (status: 'draft' | 'published') => {
  if (!title.value.trim()) {
    errorMessage.value = '文章标题不能为空'
    return
  }

  if (!content.value.trim()) {
    errorMessage.value = '文章内容不能为空'
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const data = await api<{
      id: number
      title: string
      content: string
      category: string | null
      tags: string | null
      coverImage: string | null
      status: string | null
    }>('/api/posts', {
      method: 'POST',
      body: {
        title: title.value,
        content: content.value,
        category: category.value,
        tags: tags.value,
        coverImage: coverImage.value,
        status
      }
    })

    successMessage.value =
      status === 'draft'
        ? `草稿保存成功：${data.title}`
        : `发布成功：${data.title}`

    title.value = ''
    content.value = ''
    category.value = ''
    tags.value = ''
    coverImage.value = ''
    selectedFile.value = null
    selectedFileName.value = ''
    uploadMessage.value = ''
  } catch (error: any) {
    errorMessage.value =
      error?.message || (status === 'draft' ? '保存草稿失败' : '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">发布文章</h1>
        <p class="mt-2 text-gray-600">创建新的 Markdown 文章内容，补充分类、标签和封面</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
          <input
            v-model="title"
            placeholder="请输入文章标题"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章分类</label>
            <input
              v-model="category"
              placeholder="例如：后端"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章标签</label>
            <input
              v-model="tags"
              placeholder="多个标签可用逗号、中文逗号、顿号、分号分隔"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">封面图片</h2>
              <p class="mt-1 text-sm text-gray-500">支持 png / jpg / jpeg / webp，建议上传清晰横图</p>
            </div>

            <div class="flex flex-col gap-3 md:items-end">
              <input type="file" @change="selectFile" class="block text-sm text-gray-600" />
              <button
                @click="uploadSelectedFile"
                :disabled="uploading"
                class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {{ uploading ? '上传中...' : '上传封面' }}
              </button>
            </div>
          </div>

          <p v-if="selectedFileName" class="mt-4 text-sm text-gray-600">
            已选择文件：{{ selectedFileName }}
          </p>

          <p v-if="uploadMessage" class="mt-2 text-sm text-green-600">
            {{ uploadMessage }}
          </p>

          <div v-if="coverImage" class="mt-5">
            <p class="mb-3 text-sm font-medium text-gray-700">封面预览</p>
            <img
              :src="coverImage"
              alt="封面预览"
              class="w-full max-w-xl rounded-2xl border border-gray-200 object-cover"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">文章内容（Markdown）</label>

          <div class="grid gap-6 lg:grid-cols-2 items-stretch">
            <div class="flex flex-col">
              <div class="mb-2 text-sm font-medium text-gray-600">编辑区</div>
              <textarea
                ref="editorRef"
                v-model="content"
                @scroll="syncPreviewScroll"
                placeholder="请输入 Markdown 内容"
                class="h-[600px] w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none bg-white"
              ></textarea>
            </div>

            <div class="flex flex-col">
              <div class="mb-2 text-sm font-medium text-gray-600">预览区</div>
              <div
                ref="previewRef"
                class="h-[600px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4"
              >
                <div class="markdown-body" v-html="previewHtml"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <button
            @click="submit('draft')"
            :disabled="submitting"
            class="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {{ submitting ? '保存中...' : '保存草稿' }}
          </button>

          <button
            @click="submit('published')"
            :disabled="submitting"
            class="rounded-lg bg-gray-900 px-5 py-3 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {{ submitting ? '发布中...' : '发布文章' }}
          </button>

          <NuxtLink
            to="/my-posts"
            class="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回我的文章
          </NuxtLink>
        </div>

        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>