// src/lib/editor-config.ts
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';

export interface LanguageConfig {
  label: string;
  extension: any;
  initial: string; // 👈 리터럴이 아닌 일반 string으로 정의
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  javascript: {
    label: "JavaScript",
    extension: javascript(),
    initial: "// JS 코드를 작성하세요\nconsole.log('Hello Lab!');"
  },
  python: {
    label: "Python",
    extension: python(),
    initial: "# Python 코드를 작성하세요\nprint('Hello Lab!')"
  },
  cpp: {
    label: "C++",
    extension: cpp(),
    initial: "// C++ 코드를 작성하세요\n#include <bits/stdc++.h>\nusing namespace std;\nint main() { return 0; }"
  },
};

// 언어 키 타입 추출 (선택 사항)
export type LanguageKey = keyof typeof LANGUAGES;