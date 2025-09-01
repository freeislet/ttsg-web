# TTSG 애셋 관리 가이드

이 디렉토리는 TTSG 웹사이트에서 사용하는 모든 정적 애셋을 관리합니다.

## 폴더 구조

```
public/assets/
├── images/           # 이미지 파일들
│   ├── blog/         # 블로그 포스트 관련 이미지
│   ├── ui/           # UI 요소 이미지 (아이콘, 로고 등)
│   └── gallery/      # 갤러리 이미지
├── videos/           # 비디오 파일들
│   ├── tutorials/    # 튜토리얼 비디오
│   └── demos/        # 데모 비디오
├── audio/            # 오디오 파일들
│   └── podcasts/     # 팟캐스트 오디오
├── documents/        # 문서 파일들
│   ├── pdfs/         # PDF 문서
│   ├── presentations/ # 프레젠테이션 파일
│   └── guides/       # 가이드 문서
└── downloads/        # 다운로드 가능한 파일들
    ├── code/         # 코드 샘플
    ├── templates/    # 템플릿 파일
    └── resources/    # 기타 리소스
```

## 사용 방법

### 블로그 포스트에서 애셋 사용

```markdown
---
title: '포스트 제목'
heroImage: '/assets/images/blog/post-hero.jpg'
---

# 포스트 내용

![설명 이미지](/assets/images/blog/explanation.png)

[PDF 다운로드](/assets/documents/pdfs/guide.pdf)

<video controls>
  <source src="/assets/videos/tutorials/tutorial-1.mp4" type="video/mp4">
</video>

<audio controls>
  <source src="/assets/audio/podcasts/episode-1.mp3" type="audio/mpeg">
</audio>
```

### Astro 컴포넌트에서 애셋 사용

```astro
---
import { Image } from 'astro:assets'
---

<!-- 이미지 최적화와 함께 사용 -->
<Image 
  src="/assets/images/blog/hero.jpg" 
  alt="설명" 
  width={800} 
  height={400} 
  format="webp" 
/>

<!-- 비디오 임베드 -->
<video controls class="w-full">
  <source src="/assets/videos/demos/demo.mp4" type="video/mp4">
</video>

<!-- 다운로드 링크 -->
<a href="/assets/downloads/code/sample.zip" download>
  코드 샘플 다운로드
</a>
```

## 파일 명명 규칙

### 이미지 파일
- 블로그 썸네일: `{slug}-hero.{ext}` (예: `ttsg-introduction-hero.jpg`)
- 블로그 내용 이미지: `{slug}-{순번}.{ext}` (예: `astro-guide-01.png`)
- UI 요소: `{용도}-{설명}.{ext}` (예: `logo-main.svg`, `icon-search.png`)

### 비디오 파일
- 튜토리얼: `{주제}-tutorial-{순번}.mp4`
- 데모: `{기능}-demo.mp4`

### 문서 파일
- PDF: `{제목}-{버전}.pdf`
- 프레젠테이션: `{제목}-{날짜}.pptx`

### 다운로드 파일
- 코드 샘플: `{프로젝트명}-{버전}.zip`
- 템플릿: `{템플릿명}-template.{ext}`

## 최적화 가이드

### 이미지 최적화
- **웹용 이미지**: WebP 형식 권장, JPEG/PNG도 지원
- **썸네일**: 최대 800x400px
- **내용 이미지**: 최대 1200px 너비
- **파일 크기**: 500KB 이하 권장

### 비디오 최적화
- **형식**: MP4 (H.264 코덱) 권장
- **해상도**: 1080p 이하
- **파일 크기**: 50MB 이하 권장

### 오디오 최적화
- **형식**: MP3 또는 AAC
- **비트레이트**: 128kbps 이상
- **파일 크기**: 20MB 이하 권장

## 접근성 고려사항

- 모든 이미지에 적절한 `alt` 속성 제공
- 비디오에 자막 파일 제공 (WebVTT 형식)
- 오디오에 트랜스크립트 제공
- 색상 대비 충분히 확보

## 성능 최적화

- Astro의 이미지 최적화 기능 활용
- 지연 로딩(lazy loading) 적용
- 적절한 이미지 크기 사용
- CDN 활용 고려 (Cloudflare)

## 라이선스 및 저작권

- 모든 애셋은 적절한 라이선스 확인 후 사용
- 자체 제작 콘텐츠는 TTSG 라이선스 적용
- 외부 리소스 사용 시 출처 명시
