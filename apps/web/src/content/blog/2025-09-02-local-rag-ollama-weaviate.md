---
title: '로컬 RAG 시스템 구축하기: Ollama와 Weaviate로 프라이버시 보호하는 AI 지식베이스'
description: 'Ollama와 Weaviate를 활용하여 완전히 로컬에서 동작하는 RAG(Retrieval-Augmented Generation) 시스템을 구축하는 완전한 가이드입니다.'
pubDate: 2025-09-02
category: 'tech'
tags: ['rag', 'ollama', 'weaviate', 'local-ai', 'privacy', 'langchain']
author: 'TTSG'
draft: false
featured: false
heroImage: 'https://weaviate.io/assets/images/hero-f0235cb6218bc8b95596de10a47334c2.png'
---

# 로컬 RAG 시스템 구축하기: Ollama와 Weaviate로 프라이버시 보호하는 AI 지식베이스

대규모 언어 모델(LLM)의 한계를 극복하고 프라이버시를 보호하면서도 강력한 AI 지식베이스를 구축하고 싶으신가요? RAG(Retrieval-Augmented Generation)와 로컬 AI 도구들을 결합하면 클라우드에 의존하지 않는 완전한 로컬 AI 시스템을 만들 수 있습니다.

이 가이드에서는 **Ollama**와 **Weaviate**를 활용하여 실무에서 바로 사용할 수 있는 로컬 RAG 시스템을 단계별로 구축해보겠습니다.

## RAG란 무엇인가?

**RAG(Retrieval-Augmented Generation)** 는 외부 지식베이스에서 관련 정보를 검색하여 LLM의 응답 품질을 향상시키는 기술입니다. 기존 LLM의 한계인 지식 업데이트 지연, 환각 현상, 도메인별 전문성 부족을 해결할 수 있습니다.

![RAG with Ollama and Weaviate Architecture](https://weaviate.io/assets/images/rag-ollama-diagram-c5e713fbc8bc1592f586a3107587519b.png)
_Ollama와 Weaviate를 활용한 로컬 RAG 아키텍처 (출처: [Weaviate 공식 블로그](https://weaviate.io/blog/local-rag-with-ollama-and-weaviate))_

### 로컬 RAG의 장점

- **프라이버시 보호**: 모든 데이터가 로컬에서 처리되어 외부 유출 위험 없음
- **비용 절감**: 클라우드 API 호출 비용 없이 무제한 사용
- **커스터마이징**: 특정 도메인이나 조직에 맞는 지식베이스 구축
- **오프라인 동작**: 인터넷 연결 없이도 AI 서비스 이용 가능

## 필요한 도구들

### Ollama

- **역할**: 로컬 LLM 실행 및 관리
- **특징**: 다양한 오픈소스 모델 지원, 간편한 설치 및 사용
- **공식 사이트**: [https://ollama.ai/](https://ollama.ai/)

### Weaviate

- **역할**: 벡터 데이터베이스 및 검색 엔진
- **특징**: 고성능 벡터 검색, 하이브리드 검색 지원
- **공식 사이트**: [https://weaviate.io/](https://weaviate.io/)

### LangChain

- **역할**: RAG 파이프라인 구축 프레임워크
- **특징**: 다양한 컴포넌트 제공, 쉬운 통합
- **공식 사이트**: [https://langchain.com/](https://langchain.com/)

## 환경 설정

### Docker를 활용한 환경 구성

```yaml
# docker-compose.yml - 로컬 RAG 환경 구성
version: '3.8'
services:
  weaviate:
    image: semitechnologies/weaviate:1.22.4
    ports:
      - '8080:8080'
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'none'
      ENABLE_MODULES: 'text2vec-ollama'
      CLUSTER_HOSTNAME: 'node1'
    volumes:
      - weaviate_data:/var/lib/weaviate

  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    command: serve

volumes:
  weaviate_data:
  ollama_data:
```

### 서비스 시작 및 모델 설치

```bash
# Docker 컨테이너 시작
docker-compose up -d

# Ollama 모델 다운로드
docker exec -it $(docker ps -q --filter "ancestor=ollama/ollama:latest") ollama pull llama2:7b
docker exec -it $(docker ps -q --filter "ancestor=ollama/ollama:latest") ollama pull nomic-embed-text

# Python 패키지 설치
pip install langchain weaviate-client ollama python-dotenv
```

## 기본 RAG 시스템 구현

```python
# Ollama와 Weaviate를 활용한 로컬 RAG 구현
import weaviate
from langchain.llms import Ollama
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Weaviate
from langchain.chains import RetrievalQA
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

class LocalRAGSystem:
    def __init__(self):
        # Weaviate 클라이언트 초기화 (로컬 인스턴스)
        self.weaviate_client = weaviate.Client("http://localhost:8080")

        # Ollama 모델 설정
        self.llm = Ollama(model="llama2:7b")
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")

        # 벡터 스토어 초기화
        self.vectorstore = Weaviate(
            client=self.weaviate_client,
            index_name="DocumentIndex",
            text_key="content",
            embedding=self.embeddings
        )

    def add_documents(self, file_paths):
        """문서를 벡터 스토어에 추가"""
        documents = []

        for file_path in file_paths:
            loader = TextLoader(file_path)
            docs = loader.load()

            # 텍스트 분할
            text_splitter = CharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            split_docs = text_splitter.split_documents(docs)
            documents.extend(split_docs)

        # 벡터 스토어에 문서 추가
        self.vectorstore.add_documents(documents)

    def query(self, question):
        """RAG 기반 질의 응답"""
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": 3}  # 상위 3개 문서 검색
            ),
            return_source_documents=True
        )

        result = qa_chain({"query": question})

        return {
            "answer": result["result"],
            "sources": [doc.page_content[:200] + "..."
                       for doc in result["source_documents"]]
        }

# 사용 예시
rag_system = LocalRAGSystem()

# 문서 추가
rag_system.add_documents([
    "./docs/ai_trends.txt",
    "./docs/technical_specs.txt"
])

# 질의 실행
response = rag_system.query("2025년 AI 트렌드는 무엇인가요?")
print(f"답변: {response['answer']}")
print(f"출처: {response['sources']}")
```

## 고급 RAG 패턴

### 하이브리드 검색과 재순위화

```python
# 하이브리드 검색을 활용한 향상된 RAG
from langchain.retrievers import EnsembleRetriever
from langchain.retrievers import BM25Retriever

class AdvancedRAGSystem(LocalRAGSystem):
    def __init__(self):
        super().__init__()
        self.setup_hybrid_retriever()

    def setup_hybrid_retriever(self):
        """벡터 검색과 키워드 검색을 결합한 하이브리드 검색"""
        # BM25 키워드 검색
        self.bm25_retriever = BM25Retriever.from_documents(
            self.documents,
            k=3
        )

        # 벡터 검색
        vector_retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 3}
        )

        # 하이브리드 검색 (가중 평균)
        self.hybrid_retriever = EnsembleRetriever(
            retrievers=[vector_retriever, self.bm25_retriever],
            weights=[0.7, 0.3]  # 벡터 검색 70%, 키워드 검색 30%
        )

    def query_with_reranking(self, question):
        """재순위화를 통한 정확도 향상"""
        # 1단계: 하이브리드 검색으로 후보 문서 검색
        docs = self.hybrid_retriever.get_relevant_documents(question)

        # 2단계: 관련성 점수 기반 재순위화
        reranked_docs = self.rerank_documents(question, docs)

        # 3단계: 상위 문서로 답변 생성
        context = "\n\n".join([doc.page_content for doc in reranked_docs[:3]])

        prompt = f"""
        다음 컨텍스트를 바탕으로 질문에 답해주세요:

        컨텍스트:
        {context}

        질문: {question}

        답변:
        """

        response = self.llm(prompt)

        return {
            "answer": response,
            "context_used": context,
            "confidence": self.calculate_confidence(question, response)
        }
```

## 성능 최적화

### 벡터 인덱스 최적화 및 캐싱

```python
# 벡터 인덱스 최적화 설정
weaviate_config = {
    "vectorIndexConfig": {
        "skip": False,
        "cleanupIntervalSeconds": 300,
        "maxConnections": 64,
        "efConstruction": 128,
        "ef": -1,
        "dynamicEfMin": 100,
        "dynamicEfMax": 500,
        "dynamicEfFactor": 8,
        "vectorCacheMaxObjects": 1000000,
        "flatSearchCutoff": 40000,
        "distance": "cosine"
    }
}

# 임베딩 캐싱으로 성능 향상
from functools import lru_cache

class CachedEmbeddings(OllamaEmbeddings):
    @lru_cache(maxsize=1000)
    def embed_query(self, text):
        return super().embed_query(text)

    @lru_cache(maxsize=10000)
    def embed_documents(self, texts):
        return super().embed_documents(texts)
```

## 실무 활용 사례

### 기업 지식베이스 구축

```python
class EnterpriseKnowledgeBase:
    """기업용 지식베이스 시스템"""

    def __init__(self, company_name):
        self.company_name = company_name
        self.rag_system = AdvancedRAGSystem()

    def setup_company_documents(self, documents_path):
        """회사 문서 설정"""
        self.rag_system.add_documents_from_directory(documents_path)
        print(f"✅ {self.company_name} 지식베이스 설정 완료")

    def ask_question(self, question, department="일반"):
        """부서별 질문 처리"""
        contextualized_question = f"[{department} 부서 관련] {question}"
        result = self.rag_system.query_with_reranking(contextualized_question)

        return {
            "department": department,
            "question": question,
            "answer": result["answer"],
            "confidence": result["confidence"]
        }

# 사용 예제
kb = EnterpriseKnowledgeBase("TTSG Corp")
kb.setup_company_documents("./company_docs")

# 부서별 질문
hr_response = kb.ask_question("인사 규정에 대해 알려주세요", "인사")
security_response = kb.ask_question("보안 정책은 어떻게 되나요?", "보안")
```

## 배포 및 모니터링

### 프로덕션 환경 설정

```bash
# 프로덕션용 Docker Compose
# 백업, 모니터링, 보안 설정 포함

# 시스템 상태 모니터링
curl http://localhost:8080/v1/.well-known/ready  # Weaviate 상태
curl http://localhost:11434/api/tags            # Ollama 모델 목록
```

### 성능 모니터링

```python
class PerformanceMonitor:
    def __init__(self):
        self.query_times = []

    def time_query(self, func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()

            self.query_times.append(end_time - start_time)
            return result
        return wrapper

    def get_stats(self):
        return {
            "평균_응답_시간": f"{sum(self.query_times) / len(self.query_times):.2f}초",
            "총_쿼리_수": len(self.query_times)
        }
```

## 마무리

로컬 RAG 시스템은 프라이버시를 보호하면서도 강력한 AI 지식베이스를 구축할 수 있는 혁신적인 솔루션입니다. Ollama와 Weaviate의 조합으로 다음과 같은 이점을 얻을 수 있습니다:

- **완전한 데이터 제어권**
- **무제한 사용 가능**
- **커스터마이징 자유도**
- **오프라인 동작 지원**

이 가이드를 통해 여러분만의 로컬 RAG 시스템을 구축하고, 조직의 특성에 맞게 확장해보세요.

## 참고 링크

### 공식 문서

- [Weaviate 공식 문서](https://weaviate.io/developers/weaviate) - 벡터 데이터베이스 설정 및 사용법
- [Ollama 공식 문서](https://ollama.ai/) - 로컬 LLM 실행 가이드
- [LangChain 문서](https://python.langchain.com/) - RAG 파이프라인 구축 프레임워크

### 원본 자료

- [Local RAG with Ollama and Weaviate](https://weaviate.io/blog/local-rag-with-ollama-and-weaviate) - 이 가이드의 기반이 된 Weaviate 공식 블로그 포스트

### 추가 학습 자료

- [RAG 패턴 가이드](https://www.promptingguide.ai/techniques/rag) - RAG 기술 심화 학습
- [벡터 데이터베이스 비교](https://weaviate.io/blog/vector-database-comparison) - 다양한 벡터 DB 비교 분석

---

_더 많은 AI 개발 정보는 [TTSG 플랫폼](/)에서 확인하세요._
