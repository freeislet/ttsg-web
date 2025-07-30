/**
 * Cloudflare Function for R2 위키 조작
 * 
 * 이 함수는 R2 버킷의 위키 콘텐츠를 읽고, 쓰고, 삭제하는 기능을 제공합니다.
 * 환경 변수로 WIKI_BUCKET이 R2 버킷으로 바인딩되어 있어야 합니다.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/r2/', ''); // /r2/wiki/page-name.md -> wiki/page-name.md
  const method = request.method;
  
  // CORS 헤더 설정
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'https://ttsg.dev',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // R2 버킷 접근
    const bucket = env.WIKI_BUCKET;
    if (!bucket) {
      return new Response('R2 bucket not configured', { status: 500, headers });
    }
    
    // 리스트 조회 요청 처리
    if (path === 'wiki/list') {
      const objects = await bucket.list({ prefix: 'wiki/' });
      const files = objects.objects.map(obj => obj.key.replace('wiki/', '').replace('.md', ''));
      return new Response(JSON.stringify(files), { 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      });
    }
    
    // 개별 파일 처리
    if (method === 'GET') {
      const object = await bucket.get(path);
      if (object === null) {
        return new Response('Not found', { status: 404, headers });
      }
      return new Response(await object.text(), { headers });
      
    } else if (method === 'PUT') {
      await bucket.put(path, request.body);
      return new Response('Saved', { headers });
      
    } else if (method === 'DELETE') {
      await bucket.delete(path);
      return new Response('Deleted', { headers });
    }
    
    return new Response('Method not allowed', { status: 405, headers });
    
  } catch (error) {
    console.error('R2 operation error:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers });
  }
}
