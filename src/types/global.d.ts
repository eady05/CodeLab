export { }; // 👈 이 줄을 반드시 추가하세요
declare global {
  interface Window {
    loadPyodide: any;
    // C++은 컴파일러 API 서비스나 WebAssembly 컴파일러를 활용해야 하므로 우선 구조만 잡습니다.
  }
}