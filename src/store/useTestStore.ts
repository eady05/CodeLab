import { create } from 'zustand';

interface TestState {
  problemTitle: string;
  setProblemTitle: (title: string) => void;
}

export const useTestStore = create<TestState>((set) => ({
  problemTitle: "Hello World 출력하기", // 초기값
  setProblemTitle: (title) => set({ problemTitle: title }),
}));