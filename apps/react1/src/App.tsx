import { useState } from 'react'
import { Button, Card, formatKoreanDate, formatRelativeTime } from 'shared'
import ExampleComponent from './components/ExampleComponent'

function App() {
  const [count, setCount] = useState(0)
  const currentDate = new Date()
  const pastDate = new Date(currentDate)
  pastDate.setDate(pastDate.getDate() - 3) // 3일 전 날짜

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">TTSG React 예제 앱</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">공유 컴포넌트 사용 예시</h2>
        <p className="mb-4">
          이 예제는 <code>shared</code> 패키지의 컴포넌트와 유틸리티 함수를 사용하여 모노레포
          구조에서의 코드 재사용을 보여줍니다.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2">버튼 컴포넌트 예시:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCount(count + 1)}
                className={
                  Button({
                    text: '증가',
                    variant: 'primary',
                    size: 'medium',
                  }).className
                }
                type="button"
              >
                증가
              </button>
              <button
                onClick={() => setCount(count - 1)}
                className={
                  Button({
                    text: '감소',
                    variant: 'secondary',
                    size: 'medium',
                  }).className
                }
                type="button"
              >
                감소
              </button>
              <button
                onClick={() => setCount(0)}
                className={
                  Button({
                    text: '초기화',
                    variant: 'outline',
                    size: 'medium',
                  }).className
                }
                type="button"
              >
                초기화
              </button>
            </div>
            <p className="mt-2">카운트: {count}</p>
          </div>

          <div className="mt-4">
            <p className="mb-2">카드 컴포넌트 예시:</p>
            <div
              className={
                Card({
                  title: '정보 카드',
                  elevated: true,
                  padding: 'medium',
                }).className
              }
            >
              <h3 className={Card({ title: '정보 카드' }).titleClassName}>정보 카드</h3>
              <p className="mb-2">이 카드는 shared 패키지의 Card 컴포넌트를 사용하고 있습니다.</p>
              <p>현재 날짜: {formatKoreanDate(currentDate)}</p>
              <p>상대 시간: {formatRelativeTime(pastDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <ExampleComponent />
    </div>
  )
}

export default App
