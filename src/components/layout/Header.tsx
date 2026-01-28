/**
 * 애플리케이션 헤더 컴포넌트
 *
 * 모든 페이지 상단에 표시되는 공통 헤더입니다.
 * 로고/타이틀과 향후 네비게이션 요소를 포함할 수 있습니다.
 */
export function Header() {
  return (
    <header role="banner" className="border-b">
      <div className="container mx-auto py-3 sm:py-4 px-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
          영어 단어 학습 사전
        </h1>
      </div>
    </header>
  );
}
