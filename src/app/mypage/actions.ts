"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/services/encryption";

//백준 아이디 업데이트
export async function updateBaekjoonId(userId: number, baekjoonId: string) {
  try {
    // 1.Solved.ac API에서 사용자 정보 가져오기
    const res = await fetch(`https://solved.ac/api/v3/user/show?handle=${baekjoonId}`);
    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: "존재하지 않는 백준 아이디입니다." };
    }

    // 2. DB 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        baekjoonId: baekjoonId,
        tier: data.tier,
      },
    });
    revalidatePath("/mypage"); // 마이페이지 데이터 갱신
    return { success: true };

  } catch (error) {
    return { success: false, message: "업데이트 중 오류가 발생했습니다." };
  }
}

//github 세팅 업데이트 (추가 기능 예시)
export async function updateGithubSettings(userId: number, token: string, repo: string) {
  try {
    const encryptedToken = encrypt(token.trim()); // 👈 토큰 암호화
    await prisma.user.update({
      where: { id: userId },
      data: { githubToken: encryptedToken, githubRepo: repo },
    });
    revalidatePath("/mypage");
    return { success: true };
  } catch (error) {
    return { success: false, error: "설정 저장 실패" };
  }
}

export async function syncGithubSubmissions(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubToken: true, githubRepo: true }
  });
  if (!user?.githubToken || !user?.githubRepo) {
    return { success: false, error: "GitHub 설정을 먼저 완료해주세요." };
  }
  try {
    const decryptedToken = decrypt(user.githubToken); // 👈 토큰 복호화
    // 💡 recursive=1 옵션으로 모든 하위 폴더/파일 구조를 한 번에 가져옴
    const treeRes = await fetch(
      `https://api.github.com/repos/${user.githubRepo}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: 'no-store'
      }
    );
    if (!treeRes.ok) return { success: false, error: "GitHub 데이터를 가져오지 못했습니다." };

    const treeData = await treeRes.json();
    const allItems = treeData.tree; // 모든 파일/폴더 목록
    let totalSynced = 0;

    // 티어 판별용 키워드
    const bjTiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ruby"];
    const pgLevels = ["Lv.0", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"];

    for (const item of allItems) {
      if (
        item.type === "blob" &&
        (item.path.includes("백준") || item.path.includes("프로그래머스")) &&
        !item.path.toLowerCase().endsWith(".md")
      ) {

        const pathParts = item.path.split("/");
        const fileName = pathParts[pathParts.length - 1];

        // 문제 폴더명 가져오기 (예: "1000. A+B")
        const problemFolder = pathParts[pathParts.length - 2];
        if (!problemFolder || bjTiers.includes(problemFolder)) continue;

        // ✅ 번호와 이름 분리 로직
        let problemId = "";
        let title = "";
        if (problemFolder.includes(". ")) {
          // "1000. A+B" -> ID: "1000", Title: "A+B"
          const splitIdx = problemFolder.indexOf(". ");
          problemId = problemFolder.substring(0, splitIdx).trim();
          title = problemFolder.substring(splitIdx + 2).trim();
        } else {
          // 분리할 수 없는 경우 폴더명 전체를 ID로 사용
          problemId = problemFolder;
          title = problemFolder;
        }
        // ✅ 1. 레벨(티어) 추출 로직 보강
        let level = "Unknown";
        const platform = item.path.includes("백준") ? "BAEKJOON" : "PROGRAMMERS";

        if (platform === "BAEKJOON") {
          // 백준: Bronze, Silver 등이 포함된 폴더 찾기
          level = pathParts.find((p: any) => bjTiers.some(t => p.includes(t))) || "Unknown";
        } else if (platform === "PROGRAMMERS") {
          // 프로그래머스: 폴더명이 0~5 사이의 숫자라면 "Lv.숫자"로 변환
          const levelPart = pathParts.find((p: any) => /^[0-5]$/.test(p));
          level = levelPart ? `Lv.${levelPart}` : "Unknown";

          // 혹시 폴더명이 "level 1" 등으로 되어있을 경우를 대비
          if (level === "Unknown") {
            const altLevelPart = pathParts.find((p: any) => /level\s*([0-5])/i.test(p));
            if (altLevelPart) level = `Lv.${altLevelPart.replace(/[^0-5]/g, '')}`;
          }
        }

        // ✅ 1. 소스코드 가져오기 (이미 있는 데이터는 스킵하거나 업데이트)
        let codeContent = "GitHub 소스코드 참조";

        // 새 데이터거나 코드가 아직 없는 경우에만 fetch 실행 (API 할당량 절약)
        try {
          const contentRes = await fetch(item.url, {
            headers: { Authorization: `Bearer ${user.githubToken.trim()}` },
            cache: 'no-store'
          });
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            // GitHub API는 content를 base64로 줍니다.
            codeContent = Buffer.from(contentData.content, 'base64').toString('utf8');
          }
        } catch (error) {
          console.error(`${problemId} 코드 fetch 실패:`, error);
        }


        await prisma.submission.upsert({
          where: {
            userId_problemId_platform_language: {
              userId, problemId, platform, language: fileName.split(".").pop()?.toLowerCase() || "unknown"
            }
          },
          update: {
            title, // 이름 업데이트
            level,
            code: codeContent,
            githubUrl: `https://github.com/${user.githubRepo}/blob/main/${encodeURIComponent(item.path)}`,
          },
          create: {
            userId,
            problemId,
            title,
            level,
            platform,
            language: fileName.split(".").pop()?.toLowerCase() || "unknown",
            githubUrl: `https://github.com/${user.githubRepo}/blob/main/${encodeURIComponent(item.path)}`,
            code: codeContent,
            status: "SUCCESS"
          }
        });
        totalSynced++;
      }
    }
    revalidatePath("/mypage");
    return { success: true, count: totalSynced };
  } catch (error) {
    return { success: false, error: "동기화 중 오류 발생" };
  }
}