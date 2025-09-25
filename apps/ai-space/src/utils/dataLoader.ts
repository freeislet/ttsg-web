import { gunzip } from 'fflate'

/**
 * IDX 파일 헤더 정보
 */
interface IDXHeader {
  magic: number
  dimensions: number[]
}

/**
 * 압축된 파일을 다운로드하고 압축 해제
 */
export async function fetchAndDecompress(url: string): Promise<ArrayBuffer> {
  console.log(`📥 Downloading from: ${url}`)
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const compressedData = new Uint8Array(await response.arrayBuffer())
    
    return new Promise((resolve, reject) => {
      gunzip(compressedData, (err, decompressed) => {
        if (err) {
          reject(new Error(`압축 해제 실패: ${err.message}`))
        } else {
          resolve(decompressed.buffer)
        }
      })
    })
  } catch (error) {
    throw new Error(`데이터 다운로드 실패: ${error}`)
  }
}

/**
 * IDX 파일 헤더 파싱 (big-endian)
 */
function parseIDXHeader(buffer: ArrayBuffer): IDXHeader {
  const view = new DataView(buffer)
  
  // Magic number (4 bytes, big-endian)
  const magic = view.getUint32(0, false)
  
  // 데이터 타입 추출
  const dataType = (magic >> 8) & 0xFF
  
  // 차원 수 추출
  const numDimensions = magic & 0xFF
  
  // 각 차원의 크기 읽기
  const dimensions: number[] = []
  for (let i = 0; i < numDimensions; i++) {
    dimensions.push(view.getUint32(4 + i * 4, false))
  }
  
  return { magic, dimensions }
}

/**
 * IDX 이미지 파일 파싱
 */
export function parseIDXImages(buffer: ArrayBuffer): Float32Array[] {
  const header = parseIDXHeader(buffer)
  
  // 이미지 파일의 magic number 확인 (2051)
  if ((header.magic >> 8) !== 0x000008) {
    throw new Error(`잘못된 이미지 파일 형식: magic=${header.magic}`)
  }
  
  const [numImages, height, width] = header.dimensions
  const imageSize = height * width
  const headerSize = 4 + header.dimensions.length * 4 // magic + dimensions
  
  console.log(`📊 이미지 정보: ${numImages}개, ${height}x${width}`)
  
  const images: Float32Array[] = []
  const view = new DataView(buffer)
  
  for (let i = 0; i < numImages; i++) {
    const image = new Float32Array(imageSize)
    const offset = headerSize + i * imageSize
    
    for (let j = 0; j < imageSize; j++) {
      // 0-255 값을 0-1로 정규화
      image[j] = view.getUint8(offset + j) / 255
    }
    
    images.push(image)
  }
  
  return images
}

/**
 * IDX 라벨 파일 파싱
 */
export function parseIDXLabels(buffer: ArrayBuffer, numClasses: number = 10): Uint8Array[] {
  const header = parseIDXHeader(buffer)
  
  // 라벨 파일의 magic number 확인 (2049)
  if ((header.magic >> 8) !== 0x000001) {
    throw new Error(`잘못된 라벨 파일 형식: magic=${header.magic}`)
  }
  
  const [numLabels] = header.dimensions
  const headerSize = 4 + header.dimensions.length * 4
  
  console.log(`🏷️ 라벨 정보: ${numLabels}개`)
  
  const labels: Uint8Array[] = []
  const view = new DataView(buffer)
  
  for (let i = 0; i < numLabels; i++) {
    // 원-핫 인코딩
    const oneHot = new Uint8Array(numClasses)
    const labelValue = view.getUint8(headerSize + i)
    oneHot[labelValue] = 1
    labels.push(oneHot)
  }
  
  return labels
}

/**
 * 로컬 스토리지 캐싱 키 생성
 */
export function getCacheKey(url: string, version: string = '1.0'): string {
  return `dataset_cache_${btoa(url)}_v${version}`
}

/**
 * 로컬 스토리지에서 캐시된 데이터 로드
 */
export function loadFromCache(cacheKey: string): ArrayBuffer | null {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null
    
    const data = JSON.parse(cached)
    return new Uint8Array(data.buffer).buffer
  } catch (error) {
    console.warn('캐시 로드 실패:', error)
    return null
  }
}

/**
 * 로컬 스토리지에 데이터 캐시
 */
export function saveToCache(cacheKey: string, buffer: ArrayBuffer): void {
  try {
    const data = {
      buffer: Array.from(new Uint8Array(buffer)),
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(data))
    console.log('💾 데이터 캐시 저장 완료')
  } catch (error) {
    console.warn('캐시 저장 실패:', error)
  }
}

/**
 * 캐시 만료 확인 (7일)
 */
export function isCacheExpired(cacheKey: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): boolean {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return true
    
    const data = JSON.parse(cached)
    return Date.now() - data.timestamp > maxAge
  } catch {
    return true
  }
}
