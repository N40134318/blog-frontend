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
  createdAt?: number | null
  updatedAt?: number | null
}

type PostListResponse = {
  list: PostItem[]
  page: number
  totalPages: number
  totalElements: number
  size: number
}

const latestPosts = ref<PostItem[]>([])
const loading = ref(true)
const totalPosts = ref(0)

const splitTags = (raw: string | null | undefined) => {
  return (raw || '')
    .split(/[,，、。;；|｜]/)
    .map(tag => tag.trim())
    .filter(Boolean)
}

const formatTime = (timestamp: number | null | undefined) => {
  if (!timestamp) return '最近更新'
  return new Date(timestamp).toLocaleDateString()
}

const loadLatestPosts = async () => {
  try {
    const data = await api<PostListResponse>('/api/posts?page=0&size=6&keyword=')
    latestPosts.value = data.list || []
    totalPosts.value = data.totalElements || 0
  } catch (error) {
    latestPosts.value = []
    totalPosts.value = 0
  } finally {
    loading.value = false
  }
}

const categoryList = computed(() => {
  const map = new Map<string, number>()

  for (const post of latestPosts.value) {
    const key = (post.category || '未分类').trim() || '未分类'
    map.set(key, (map.get(key) || 0) + 1)
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

const tagList = computed(() => {
  const map = new Map<string, number>()

  for (const post of latestPosts.value) {
    for (const tag of splitTags(post.tags)) {
      map.set(tag, (map.get(tag) || 0) + 1)
    }
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

const latestUpdatedText = computed(() => {
  const timestamps = latestPosts.value
    .map(post => post.updatedAt || post.createdAt || 0)
    .filter(Boolean)

  if (timestamps.length === 0) return '暂无更新记录'

  const latest = Math.max(...timestamps)
  return formatTime(latest)
})

onMounted(loadLatestPosts)
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Hero -->
    <section class="border-b border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          <div>
            <div class="inline-flex rounded-full bg-blue-50 px-4 py-1 text-sm text-blue-700">
              Rainstorm Blog
            </div>

            <h1 class="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              一个持续迭代中的
              <span class="text-blue-600">工程化个人博客系统</span>
            </h1>

            <p class="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
              记录开发、部署、后端接口、前端交互与内容组织实践。
              当前已经具备登录鉴权、文章管理、Markdown 渲染、评论系统、封面上传、
              分类标签、分页搜索、草稿发布、目录导航与代码块增强等完整能力。
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
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">JWT 登录鉴权</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Markdown 渲染</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">代码高亮复制</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">目录 TOC</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">草稿 / 发布</span>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">评论系统</span>
            </div>
          </div>

          <div class="grid gap-4">
            <div class="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
              <div class="text-sm text-gray-300">内容概览</div>
              <div class="mt-4 text-3xl font-bold">{{ totalPosts }}</div>
              <div class="mt-2 text-sm text-gray-400">当前已公开文章总数</div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div class="text-sm text-gray-500">最近更新</div>
              <div class="mt-3 text-xl font-semibold text-gray-900">
                {{ latestUpdatedText }}
              </div>
              <div class="mt-2 text-sm text-gray-600">
                首页数据会自动读取最新文章内容进行展示
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div class="text-sm text-gray-500">当前阶段特点</div>
              <ul class="mt-4 space-y-2 text-sm text-gray-700">
                <li>• 前后端分离</li>
                <li>• Markdown 文章阅读体验已成型</li>
                <li>• 适合继续扩展后台与内容体系</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">最新文章</h2>
          <p class="mt-2 text-gray-600">最近发布的内容预览与阅读入口</p>
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

      <EmptyState
        v-else-if="latestPosts.length === 0"
        title="还没有文章"
        description="当前还没有最新文章内容，去发布第一篇文章吧。"
        action-text="去发布文章"
        action-to="/create-post"
      />

      <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="post in latestPosts"
          :key="post.id"
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div v-if="post.coverImage" class="bg-gray-100">
            <img
              :src="post.coverImage"
              alt="封面图"
              class="h-52 w-full object-cover"
            />
          </div>

          <div class="p-5">
            <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {{ post.author || '未知作者' }}
              </span>

              <span class="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                {{ post.category || '未分类' }}
              </span>
            </div>

            <NuxtLink :to="`/posts/${post.id}`" class="block">
              <h3 class="text-xl font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2">
                {{ post.title }}
              </h3>
            </NuxtLink>

            <p class="mt-3 text-sm leading-6 text-gray-600 line-clamp-3 min-h-[4.5rem]">
              {{ post.summary }}
            </p>

            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <template v-for="tag in splitTags(post.tags).slice(0, 3)" :key="tag">
                <NuxtLink
                  :to="`/tags/${encodeURIComponent(tag)}`"
                  class="rounded-full bg-green-50 px-3 py-1 text-green-700 hover:bg-green-100 transition"
                >
                  # {{ tag }}
                </NuxtLink>
              </template>
            </div>

            <div class="mt-5 flex items-center justify-between gap-3">
              <div class="text-xs text-gray-500">
                {{ formatTime(post.updatedAt || post.createdAt) }}
              </div>

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

    <!-- 分类 / 标签 -->
    <section class="bg-white border-y border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-14">
        <div class="grid gap-8 lg:grid-cols-2">
          <div>
            <div class="mb-6">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900">分类速览</h2>
              <p class="mt-2 text-gray-600">从最新内容中提取的分类分布</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <NuxtLink
                v-for="category in categoryList"
                :key="category.name"
                :to="`/categories/${encodeURIComponent(category.name)}`"
                class="rounded-2xl border border-gray-200 bg-gray-50 p-5 hover:bg-gray-100 transition"
              >
                <div class="text-lg font-semibold text-gray-900">{{ category.name }}</div>
                <div class="mt-2 text-sm text-gray-500">
                  最近文章中出现 {{ category.count }} 次
                </div>
              </NuxtLink>

              <div
                v-if="categoryList.length === 0"
                class="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500"
              >
                暂无分类数据
              </div>
            </div>
          </div>

          <div>
            <div class="mb-6">
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900">标签速览</h2>
              <p class="mt-2 text-gray-600">快速进入你关心的内容主题</p>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div class="flex flex-wrap gap-3">
                <NuxtLink
                  v-for="tag in tagList"
                  :key="tag.name"
                  :to="`/tags/${encodeURIComponent(tag.name)}`"
                  class="rounded-full bg-white px-4 py-2 text-sm text-gray-700 border border-gray-200 hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition"
                >
                  # {{ tag.name }}（{{ tag.count }}）
                </NuxtLink>

                <span
                  v-if="tagList.length === 0"
                  class="text-sm text-gray-500"
                >
                  暂无标签数据
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目能力 -->
    <section class="max-w-6xl mx-auto px-4 py-14">
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">项目能力</h2>
        <p class="mt-2 text-gray-600">当前博客系统已经具备的核心功能</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900">认证鉴权</h3>
          <p class="mt-3 text-sm leading-6 text-gray-600">
            支持注册、登录、JWT 鉴权、登录态持久化，以及基于当前用户的接口权限判断。
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900">文章系统</h3>
          <p class="mt-3 text-sm leading-6 text-gray-600">
            支持文章发布、编辑、删除、详情展示、作者关联、我的文章，以及封面图展示。
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900">内容组织</h3>
          <p class="mt-3 text-sm leading-6 text-gray-600">
            支持分类、标签、关键词搜索、分页展示，便于继续扩展分类页、标签页与推荐模块。
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900">阅读体验</h3>
          <p class="mt-3 text-sm leading-6 text-gray-600">
            已具备 Markdown 渲染、目录导航、代码高亮、语言标签、代码复制等增强能力。
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-6xl mx-auto px-4 pb-14">
      <div class="rounded-3xl bg-gray-900 px-8 py-12 text-center text-white">
        <h2 class="text-2xl md:text-3xl font-bold">准备好继续扩展这个博客系统了吗？</h2>
        <p class="mt-3 text-gray-300">
          现在它已经不仅能发文章，也开始具备了工程化博客应有的阅读体验和内容组织能力。
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
            继续阅读内容
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>