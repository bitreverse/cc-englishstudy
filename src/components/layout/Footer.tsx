/**
 * 애플리케이션 푸터 컴포넌트
 *
 * 모든 페이지 하단에 표시되는 공통 푸터입니다.
 * 저작권 정보와 향후 추가 링크를 포함할 수 있습니다.
 */
export function Footer() {
  return (
    <footer role="contentinfo" className="border-t mt-auto">
      <div className="container mx-auto py-4 px-4 text-center text-muted-foreground">
        <p>&copy; 2026 영어 단어 학습 사전</p>
      </div>
    </footer>
  );
}
