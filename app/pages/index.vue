<script setup lang="ts">
const api = useApi()

type PostItem = {
  id: number
  title: string
  summary: string
  author: string | null
  category: string | null
  tags: string | null
  coverImage: string | null
}

const latestPosts = ref<PostItem[]>([])
const loading = ref(true)

const loadLatestPosts = async () => {
  try {
    const data = await api<{
      list: PostItem[]
      page: number
      totalPages: number
      totalElements: number
      size: number
    }>('/api/posts?page=0&size=3&keyword=')

    latestPosts.value = data.list || []
  } catch (error) {
    latestPosts.value = []
  } finally {
    loading.value = false
  }
}

const splitTags = (raw: string | null | undefined) => {
  return (raw || '')
    .split(/[,，、。;；|｜]/)
    .map(tag => tag.trim())
    .filter(Boolean)
}

onMounted(loadLatestPosts)
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <section class="border-b border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div class="max-w-3xl">
          <div class="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm text-blue-700">
            Rainstorm Blog
          </div>

          <h1 class="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            一个支持登录、发文、评论、封面上传的个人博客系统
          </h1>

          <p class="mt-6 text-lg leading-8 text-gray-600">
            这是一个基于前后端分离实现的博客项目，已经具备 JWT 登录鉴权、文章管理、
            评论系统、图片上传、分类标签、分页搜索等完整能力。
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              to="/posts"
              class="rounded-xl bg-gray-900 px-6 py-3 text-white hover:bg-gray-800 transition"
            >
              浏览文章
            </NuxtLink>

            <NuxtLink
              to="/create-post"
              class="rounded-xl border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 transition"
            >
              开始写作
            </NuxtLink>
          </div>

          <div class="mt-10 flex flex-wrap gap-3 text-sm">
            <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">JWT 登录</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">评论系统</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">封面上传</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">分类标签</span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">分页搜索</span>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">最新文章</h2>
          <p class="mt-2 text-gray-600">最近发布的内容预览</p>
        </div>

        <NuxtLink
          to="/posts"
          class="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          查看全部 →
        </NuxtLink>
      </div>

      <div v-if="loading" class="text-gray-500">
        加载中...
      </div>

      <div
        v-else-if="latestPosts.length === 0"
        class="rounded-2xl border border-gray-200 bg-white p-8 text-gray-500"
      >
        还没有文章，去发布第一篇吧。
      </div>

      <div v-else class="grid gap-6 md:grid-cols-3">
        <article
          v-for="post in latestPosts"
          :key="post.id"
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div v-if="post.coverImage" class="bg-gray-100">
            <img
              :src="post.coverImage"
              alt="封面图"
              class="h-52 w-full object-cover"
            />
          </div>

          <div class="p-5">
            <NuxtLink :to="`/posts/${post.id}`" class="block">
              <h3 class="text-xl font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2">
                {{ post.title }}
              </h3>
            </NuxtLink>

            <p class="mt-3 text-sm leading-6 text-gray-600 line-clamp-3">
              {{ post.summary }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {{ post.author || '未知作者' }}
              </span>

              <NuxtLink
                :to="`/categories/${encodeURIComponent(post.category || '未分类')}`"
                class="rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100 transition"
              >
                {{ post.category || '未分类' }}
              </NuxtLink>

              <template v-for="tag in splitTags(post.tags).slice(0, 2)" :key="tag">
                <NuxtLink
                  :to="`/tags/${encodeURIComponent(tag)}`"
                  class="rounded-full bg-green-50 px-3 py-1 text-green-700 hover:bg-green-100 transition"
                >
                  # {{ tag }}
                </NuxtLink>
              </template>
            </div>

            <div class="mt-5">
              <NuxtLink
                :to="`/posts/${post.id}`"
                class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                阅读全文
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-white border-y border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-14">
        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">项目能力</h2>
          <p class="mt-2 text-gray-600">当前博客系统已经具备的核心功能</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900">认证鉴权</h3>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              支持注册、登录、JWT 鉴权、登录态持久化，以及基于当前用户的接口权限判断。
            </p>
          </div>

          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900">文章系统</h3>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              支持文章发布、编辑、删除、详情展示、作者关联、我的文章，以及封面图展示。
            </p>
          </div>

          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900">内容组织</h3>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              支持分类、标签、关键词搜索、分页展示，便于后续继续扩展分类页和标签页。
            </p>
          </div>

          <div class="rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900">互动与上传</h3>
            <p class="mt-3 text-sm leading-6 text-gray-600">
              支持评论发布、评论删除权限控制，以及图片上传、封面持久化和静态资源访问。
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="rounded-3xl bg-gray-900 px-8 py-12 text-center text-white">
        <h2 class="text-2xl md:text-3xl font-bold">准备好开始写你的第一篇文章了吗？</h2>
        <p class="mt-3 text-gray-300">
          登录后即可创建文章、上传封面，并在详情页中参与评论互动。
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/create-post"
            class="rounded-xl bg-white px-6 py-3 text-gray-900 hover:bg-gray-100 transition"
          >
            去发布文章
          </NuxtLink>

          <NuxtLink
            to="/posts"
            class="rounded-xl border border-gray-600 px-6 py-3 text-white hover:bg-gray-800 transition"
          >
            先看看文章
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>