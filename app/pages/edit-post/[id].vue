<script setup lang="ts">
const route = useRoute()
const api = useApi()

const title = ref('')
const content = ref('')
const category = ref('')
const tags = ref('')
const coverImage = ref('')
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const errorMessage = ref('')
const uploadMessage = ref('')
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')

const loadPost = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await api<{
      id: number
      title: string
      content: string
      category: string | null
      tags: string | null
      coverImage: string | null
    }>(`/api/posts/${route.params.id}`)

    title.value = data.title
    content.value = data.content
    category.value = data.category || ''
    tags.value = data.tags || ''
    coverImage.value = data.coverImage || ''
  } catch (error: any) {
    errorMessage.value = error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

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

const submit = async () => {
  errorMessage.value = ''

  try {
    saving.value = true

    const data = await api<{
      id: number
      title: string
      content: string
      category: string | null
      tags: string | null
      coverImage: string | null
    }>(`/api/posts/${route.params.id}`, {
      method: 'PUT',
      body: {
        title: title.value,
        content: content.value,
        category: category.value,
        tags: tags.value,
        coverImage: coverImage.value
      }
    })

    await navigateTo(`/posts/${data.id}`)
  } catch (error: any) {
    errorMessage.value = error?.message || '修改失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadPost)
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">编辑文章</h1>
        <p class="mt-2 text-gray-600">修改文章内容、分类、标签和封面</p>
      </div>

      <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-8 text-gray-500">
        加载中...
      </div>

      <div
        v-else-if="errorMessage && !title && !content"
        class="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4"
      >
        {{ errorMessage }}
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
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
            <p class="mb-3 text-sm font-medium text-gray-700">当前封面预览</p>
            <img
              :src="coverImage"
              alt="封面预览"
              class="w-full max-w-xl rounded-2xl border border-gray-200 object-cover"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">文章内容</label>
          <textarea
            v-model="content"
            placeholder="请输入文章内容"
            class="w-full min-h-[220px] rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <button
            @click="submit"
            :disabled="saving"
            class="rounded-lg bg-gray-900 px-5 py-3 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存修改' }}
          </button>

          <NuxtLink
            :to="`/posts/${route.params.id}`"
            class="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回详情
          </NuxtLink>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>