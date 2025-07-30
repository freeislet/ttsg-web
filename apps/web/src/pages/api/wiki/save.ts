import type { APIRoute } from 'astro';
import { saveWikiToR2 } from '../../../utils/r2-client';

/**
 * 위키 콘텐츠 저장 API 엔드포인트
 */
export const POST: APIRoute = async ({ request, url }) => {
  // 인증 확인 (구현 필요)
  // if (!isAuthenticated(request)) {
  //   return new Response(JSON.stringify({ error: '인증 필요' }), { status: 401 });
  // }
  
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: '페이지 식별자 필요' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const content = await request.text();
    const success = await saveWikiToR2(slug, content);
    
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: '저장 실패' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `오류 발생: ${error.message}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
