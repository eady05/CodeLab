import * as cheerio from 'cheerio';

export const bjhService = {
  async getProblem(problemId: string) {
    const response = await fetch(`https://www.acmicpc.net/problem/${problemId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // 선택사항: 1시간 동안은 캐시된 데이터를 사용 (속도 향상)
    });

    if (!response.ok) throw new Error('문제를 찾을 수 없습니다.');

    const html = await response.text();
    const $ = cheerio.load(html);

    // 🖼️ 이미지 경로 보정 로직 추가
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src && src.startsWith('/')) {
        // 상대 경로(/img/...)를 절대 경로(https://www.acmicpc.net/...)로 변경
        $(element).attr('src', `https://www.acmicpc.net${src}`);
      }
      // 스타일 깨짐 방지를 위해 클래스 추가 (선택사항)
      $(element).addClass('max-w-full h-auto my-4 rounded-md shadow-sm');
    });

    return {
      title: $('#problem_title').text().trim(),
      description: $('#problem_description').html()?.trim(),
      inputDescription: $('#problem_input').html()?.trim(),  // 이름 변경: 입력 설명
      outputDescription: $('#problem_output').html()?.trim(), // 이름 변경: 출력 설명
      // 여기에 예제 데이터를 추가로 긁어오면 좋습니다 (아래 팁 참고)
      sampleInput: $('#sample-input-1').text().trim(),
      sampleOutput: $('#sample-output-1').text().trim(),
    };
  }
};