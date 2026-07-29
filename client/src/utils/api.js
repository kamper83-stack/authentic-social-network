export async function fetchPosts(filter = 'all') {
  const res = await fetch(`/api/posts?filter=${filter}`);
  return res.json();
}

export async function analyzeDraft(content, file) {
  const formData = new FormData();
  formData.append('content', content);
  if (file) {
    formData.append('image', file);
  }

  const res = await fetch('/api/posts/analyze', {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function createPost(content, file, imageUrl) {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('userId', 'u1');
  if (file) {
    formData.append('image', file);
  } else if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const res = await fetch('/api/posts', {
    method: 'POST',
    body: formData
  });
  return res.json();
}

export async function toggleLike(postId) {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1' })
  });
  return res.json();
}

export async function fetchComments(postId) {
  const res = await fetch(`/api/posts/${postId}/comments`);
  return res.json();
}

export async function addComment(postId, content) {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', content })
  });
  return res.json();
}

export async function reportAiContent(postId, reason) {
  const res = await fetch(`/api/posts/${postId}/report-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', reason })
  });
  return res.json();
}

export async function fetchModerationQueue() {
  const res = await fetch('/api/moderation/flagged');
  return res.json();
}

export async function resolveModeration(postId, decision) {
  const res = await fetch('/api/moderation/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, decision })
  });
  return res.json();
}

export async function fetchUserProfile(userId = 'u1') {
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
}
