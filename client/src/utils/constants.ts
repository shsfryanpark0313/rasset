export const SURVEY_CONSTANTS = {
    Q1_OPTIONS: {
        used: { label: '① 실제로 사용해봤어요', no: 1 },
        knew_no_opportunity: { label: '② 알고는 있었지만, 사용 상황 없음', no: 2 },
        knew_not_used: { label: '③ 알고 있었지만, 안 씀', no: 3 },
        saw_unknown: { label: '④ 본 적 있지만 용도 모름', no: 4 }
    },
    Q2_OPTIONS: {
        used_helpful_will_use: { label: '① 도움됨/계속사용', no: 1 },
        used_not_enough: { label: '② 기대 미치지못함', no: 2 },
        not_used_will_try: { label: '③ 안썼지만 써볼의향', no: 3 },
        not_used_no_need: { label: '④ 필요성 못느낌', no: 4 }
    },
    Q3_SCORES: {
        much_better: { label: '① 훨씬 쾌적함', score: 5 },
        somewhat_better: { label: '② 조금 나아짐', score: 4 },
        no_difference: { label: '③ 비슷함', score: 3 },
        not_sure: { label: '④ 잘 모르겠음', score: 1 },
        worse: { label: '⑤ 나빠짐', score: 2 }
    },
    Q4_REASONS: {
        can_report_directly: '직접 신고 가능',
        no_direct_contact: '비대면 처리',
        can_check_result: '결과 확인 가능',
        actually_improved: '실제 개선 체감',
        slow_response: '느린 응답/변화 없음',
        confusing_location: '위치/사용법 혼동',
        other: '기타'
    },
    Q6_COMPARISON: {
        much_better: '① 훨씬 나음',
        similar: '② 비슷함',
        worse: '③ 오히려 불편'
    },
    Q7_FREQUENCY: {
        daily: '① 매일',
        weekly: '② 주 1-2회',
        monthly: '③ 월 1-2회',
        first_time: '④ 처음'
    }
};

export const getQ1Label = (key: string) => SURVEY_CONSTANTS.Q1_OPTIONS[key as keyof typeof SURVEY_CONSTANTS.Q1_OPTIONS]?.label || key;
export const getQ3Score = (key: string) => SURVEY_CONSTANTS.Q3_SCORES[key as keyof typeof SURVEY_CONSTANTS.Q3_SCORES]?.score || 0;
export const getQ4Label = (key: string) => SURVEY_CONSTANTS.Q4_REASONS[key as keyof typeof SURVEY_CONSTANTS.Q4_REASONS] || key;
