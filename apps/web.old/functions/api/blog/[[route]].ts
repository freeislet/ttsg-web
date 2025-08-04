/**
 * Cloudflare Pages Function for R2 블로그 조작
 *
 * 이 함수는 R2 버킷의 블로그 콘텐츠를 읽고, 쓰고, 삭제하는 기능을 제공합니다.
 * 환경 변수로 BUCKET이 R2 버킷으로 바인딩되어 있어야 합니다.
 */

export interface Env {
  BUCKET: R2Bucket
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context
  const url = new URL(request.url)
  const route = params.route ? params.route.toString() : ''
  const slug = route || url.searchParams.get('slug') || ''
  const method = request.method

  // CORS 헤더 설정
  const headers = new Headers({
    'Access-Control-Allow-Origin': url.origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  // OPTIONS 요청 처리 (CORS preflight)
  if (method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    // R2 버킷 접근
    const bucket = env.BUCKET
    if (!bucket) {
      return new Response('R2 bucket not configured', {
        status: 500,
        headers,
      })
    }

    // 목록 조회 요청 처리
    if (route === 'list') {
      const objects = await bucket.list({ prefix: 'blog/' })
      const files = objects.objects.map((obj: R2Object) =>
        obj.key.replace('blog/', '').replace('.md', '')
      )
      return new Response(JSON.stringify(files), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    // 개별 파일 처리
    const path = `blog/${slug}.md`

    if (method === 'GET') {
      const object = await bucket.get(path)
      if (object === null) {
        return new Response('Not found', { status: 404, headers })
      }
      return new Response(await object.text(), { headers })
    } else if (method === 'PUT' || method === 'POST') {
      const content = await request.text()
      await bucket.put(path, content)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    } else if (method === 'DELETE') {
      await bucket.delete(path)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response('Method not allowed', { status: 405, headers })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(`Error: ${(error as Error).message}`, {
      status: 500,
      headers,
    })
  }
}
