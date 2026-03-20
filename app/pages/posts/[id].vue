<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '~/composables/useMarkdown'

const route = useRoute()
const api = useApi()

type PostDetail = {
  id: number
  title: string
  summary: string | null
  content: string
  author: string | null
  category: string | null
  tags: string | null
  coverImage: string | null
}

type CommentItem = {
  id: number
  postId: number
  author: string
  content: string
  createdAt: number
}

const post = ref<PostDetail | null>(null)
const comments = ref<CommentItem[]>([])
const commentContent = ref('')
const loading = ref(true)
const commentLoading = ref(false)
const errorMessage = ref('')
const commentErrorMessage = ref('')
const currentUsername = ref('')

const renderedContent = computed(() => {
  return renderMarkdown(post.value?.content || '')
})

const loadPost = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await api<PostDetail>(`/api/posts/${route.params.id}`)
    post.value = data
  } catch (error: any) {
    errorMessage.value = error?.message || '加载文章失败'
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    const data = await api<CommentItem[]>(`/api/posts/${route.params.id}/comments`)
    comments.value = data
  } catch (error: any) {
    commentErrorMessage.value = error?.message || '加载评论失败'
  }
}

const loadCurrentUser = async () => {
  try {
    const data = await api<{ username: string }>('/api/auth/me')
    currentUsername.value = data.username
  } catch (error) {
    currentUsername.value = ''
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    commentErrorMessage.value = '评论内容不能为空'
    return
  }

  try {
    commentLoading.value = true
    commentErrorMessage.value = ''

    await api(`/api/posts/${route.params.id}/comments`, {
      method: 'POST',
      body: {
        content: commentContent.value
      }
    })

    commentContent.value = ''
    await loadComments()
  } catch (error: any) {
    commentErrorMessage.value = error?.message || '发表评论失败'
  } finally {
    commentLoading.value = false
  }
}

const deleteComment = async (commentId: number) => {
  try {
    await api(`/api/comments/${commentId}`, {
      method: 'DELETE'
    })
    await loadComments()
  } catch (error: any) {
    commentErrorMessage.value = error?.message || '删除评论失败'
  }
}

const deletePost = async () => {
  if (!confirm('确定要删除这篇文章吗？')) {
    return
  }

  try {
    await api(`/api/posts/${route.params.id}`, {
      method: 'DELETE'
    })
    await navigateTo('/my-posts')
  } catch (error: any) {
    errorMessage.value = error?.message || '删除文章失败'
  }
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString()
}

const splitTags = (raw: string | null | undefined) => {
  return (raw || '')
    .split(/[,，、。;；|｜]/)
    .map(tag => tag.trim())
    .filter(Boolean)
}

onMounted(async () => {
  await loadCurrentUser()
  await loadPost()
  await loadComments()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-gray-500 py-10">
        加载中...
      </div>

      <div
        v-else-if="errorMessage"
        class="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4"
      >
        {{ errorMessage }}
      </div>

      <div v-else-if="post" class="space-y-6">
        <article class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div v-if="post.coverImage" class="bg-gray-100">
            <img
              :src="post.coverImage"
              alt="封面图"
              class="w-full max-h-[420px] object-cover"
            />
          </div>

          <div class="p-6 md:p-8">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {{ post.title }}
            </h1>

            <div class="mt-4 flex flex-wrap gap-2 text-sm">
              <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                作者：{{ post.author || '未知作者' }}
              </span>

              <NuxtLink
                :to="`/categories/${encodeURIComponent(post.category || '未分类')}`"
                class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
              >
                分类：{{ post.category || '未分类' }}
              </NuxtLink>

              <template v-if="splitTags(post.tags).length > 0">
                <NuxtLink
                  v-for="tag in splitTags(post.tags)"
                  :key="tag"
                  :to="`/tags/${encodeURIComponent(tag)}`"
                  class="px-3 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition"
                >
                  # {{ tag }}
                </NuxtLink>
              </template>

              <span
                v-else
                class="px-3 py-1 rounded-full bg-green-50 text-green-700"
              >
                无标签
              </span>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink
                :to="`/edit-post/${post.id}`"
                class="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
              >
                编辑这篇文章
              </NuxtLink>

              <button
                @click="deletePost"
                class="inline-flex items-center rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition"
              >
                删除这篇文章
              </button>
            </div>

            <div class="mt-8 border-t border-gray-200 pt-8">
              <div
                class="markdown-body"
                v-html="renderedContent"
              ></div>
            </div>
          </div>
        </article>

        <section class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">评论区</h2>

          <div class="space-y-3">
            <textarea
              v-model="commentContent"
              placeholder="写下你的评论"
              class="w-full min-h-[120px] rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="submitComment"
              :disabled="commentLoading"
              class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {{ commentLoading ? '提交中...' : '发表评论' }}
            </button>
          </div>

          <p v-if="commentErrorMessage" class="mt-3 text-red-600">
            {{ commentErrorMessage }}
          </p>

          <div class="mt-8 space-y-4">
            <EmptyState
              v-if="comments.length === 0"
              title="还没有评论"
              description="来发表第一条评论，参与这篇文章的讨论。"
            />

            <article
              v-for="comment in comments"
              :key="comment.id"
              class="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ comment.author }}
                    <span
                      v-if="currentUsername && currentUsername === comment.author"
                      class="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                    >
                      我的评论
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-gray-500">
                    {{ formatTime(comment.createdAt) }}
                  </div>
                </div>

                <button
                  v-if="currentUsername && currentUsername === comment.author"
                  @click="deleteComment(comment.id)"
                  class="text-sm text-red-600 hover:text-red-700"
                >
                  删除评论
                </button>
              </div>

              <p class="mt-3 text-gray-700 leading-7 whitespace-pre-wrap">
                {{ comment.content }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>