<script setup lang="ts">
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
    }>('/api/posts', {
      method: 'POST',
      body: {
        title: title.value,
        content: content.value,
        category: category.value,
        tags: tags.value,
        coverImage: coverImage.value
      }
    })

    successMessage.value = `发布成功：${data.title}`

    title.value = ''
    content.value = ''
    category.value = ''
    tags.value = ''
    coverImage.value = ''
    selectedFile.value = null
    selectedFileName.value = ''
    uploadMessage.value = ''
  } catch (error: any) {
    errorMessage.value = error?.message || '发布失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">发布文章</h1>
        <p class="mt-2 text-gray-600">创建新的文章内容，补充分类、标签和封面</p>
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
          <label class="block text-sm font-medium text-gray-700 mb-2">文章内容</label>
          <textarea
            v-model="content"
            placeholder="请输入文章内容"
            class="w-full min-h-[240px] rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <button
            @click="submit"
            :disabled="submitting"
            class="rounded-lg bg-gray-900 px-5 py-3 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {{ submitting ? '发布中...' : '提交发布' }}
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
