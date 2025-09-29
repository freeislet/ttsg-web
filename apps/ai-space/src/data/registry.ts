import { DatasetDesc } from './types'

/**
 * 데이터셋 레지스트리
 * - 전역 인스턴스 `dataRegistry`를 통해 데이터셋 설명을 등록/조회
 */
export class DataRegistry {
  private byId = new Map<string, DatasetDesc>()

  /** 등록 (동일 ID는 덮어쓰기) */
  register(desc: DatasetDesc) {
    this.byId.set(desc.id, desc)
  }

  /** 여러 개 일괄 등록 */
  registerMany(descs: DatasetDesc[]) {
    for (const d of descs) this.register(d)
  }

  /** 전체 목록 */
  all(): DatasetDesc[] {
    return Array.from(this.byId.values())
  }

  /** 단건 조회 */
  get(id: string): DatasetDesc | undefined {
    return this.byId.get(id)
  }

  /** 카테고리별 */
  byCategory(category: 'sample' | 'computed'): DatasetDesc[] {
    return this.all().filter((d) => d.category === category)
  }

  /** 태그별 */
  byTag(tag: string): DatasetDesc[] {
    return this.all().filter((d) => d.tags?.includes(tag))
  }

  /** 난이도별 */
  byDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): DatasetDesc[] {
    return this.all().filter((d) => d.difficulty === difficulty)
  }
}

/** 전역 인스턴스 */
export const dataRegistry = new DataRegistry()
