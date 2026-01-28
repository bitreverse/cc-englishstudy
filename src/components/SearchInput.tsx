'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * SearchInput Props
 */
interface SearchInputProps {
  /** 입력 필드의 기본값 */
  defaultValue?: string;
  /** 자동 포커스 여부 */
  autoFocus?: boolean;
  /** 검색 실행 콜백 (선택적, 없으면 페이지 이동) */
  onSearch?: (word: string) => void;
}

/**
 * 검색 입력창 컴포넌트
 *
 * 영어 단어 검색을 위한 입력창과 검색 버튼을 제공합니다.
 * 영어 알파벳, 공백, 하이픈만 입력 가능하며,
 * 빈 값이나 잘못된 입력에 대해 에러 메시지를 표시합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용 (페이지 이동)
 * <SearchInput autoFocus />
 *
 * // 커스텀 검색 처리
 * <SearchInput
 *   defaultValue="hello"
 *   onSearch={(word) => console.log(word)}
 * />
 * ```
 */
export function SearchInput({
  defaultValue = '',
  autoFocus = false,
  onSearch,
}: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();

    // 빈 입력 체크
    if (!trimmed) {
      setError(ERROR_MESSAGES.EMPTY_INPUT);
      return;
    }

    // 영어 알파벳, 공백, 하이픈만 허용
    if (!/^[a-zA-Z\s-]+$/.test(trimmed)) {
      setError(ERROR_MESSAGES.INVALID_INPUT);
      return;
    }

    // 검색 실행
    setError('');
    if (onSearch) {
      onSearch(trimmed);
    } else {
      // useTransition으로 페이지 이동 래핑
      startTransition(() => {
        router.push(`/search/${encodeURIComponent(trimmed)}`);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <label htmlFor="word-search" className="sr-only">
        검색할 영어 단어
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="word-search"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            // 입력 시 에러 메시지 제거
            if (error) setError('');
          }}
          placeholder="영어 단어를 입력하세요"
          autoFocus={autoFocus}
          className="flex-1 text-base"
          disabled={isPending}
          aria-invalid={!!error}
          aria-describedby={error ? 'search-error' : undefined}
        />
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검색 중
            </>
          ) : (
            '검색'
          )}
        </Button>
      </div>
      {error && (
        <p id="search-error" className="text-sm text-destructive mt-2" role="alert">
          {error}
        </p>
      )}
      {/* 스크린 리더 상태 알림 */}
      <div role="status" aria-live="polite" className="sr-only">
        {isPending && '검색 중입니다'}
      </div>
    </form>
  );
}
