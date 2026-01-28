import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import Card from '../components/Card';
import { qrService, surveyService } from '../services/api';
import { AlertCircle, CheckCircle2, Gift, Sparkles, ArrowRight } from 'lucide-react';

const MobileSurvey: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Stages: loading -> verifying -> survey -> personalInfo -> submitting -> success -> error
    const [stage, setStage] = useState<'loading' | 'survey' | 'personalInfo' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    // Survey Data
    const [answers, setAnswers] = useState<any>({});
    const [q4ReasonOther, setQ4ReasonOther] = useState<string>(''); // Q4 기타 입력

    // Tablet response info
    const [hasTabletResponse, setHasTabletResponse] = useState<boolean>(false);
    const [tabletResponses, setTabletResponses] = useState<any>(null);

    // Personal Info Data
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneConfirm, setPhoneConfirm] = useState('');
    const [consent, setConsent] = useState(false);

    // Verification Effect
    useEffect(() => {
        // 개발 모드: dev=true 파라미터가 있거나 토큰이 없으면 개발 모드로 진행
        const isDevMode = searchParams.get('dev') === 'true' || import.meta.env.DEV;

        if (!token && !isDevMode) {
            setErrorMessage('유효하지 않은 접근입니다. (토큰 누락)');
            setStage('error');
            return;
        }

        // 개발 모드에서는 토큰 검증 건너뛰기
        if (isDevMode && !token) {
            console.log('🔧 [DEV MODE] 토큰 검증을 건너뜁니다.');
            setStage('survey');
            return;
        }

        const verify = async () => {
            try {
                const verifyResult = await qrService.verifyToken(token!);
                // 태블릿 응답 정보 저장
                if (verifyResult.hasTabletResponse && verifyResult.tabletResponses) {
                    setHasTabletResponse(true);
                    setTabletResponses(verifyResult.tabletResponses);
                }
                setStage('survey');
            } catch (error: any) {
                // 개발 모드에서는 에러를 무시하고 진행
                if (isDevMode) {
                    console.warn('🔧 [DEV MODE] 토큰 검증 실패했지만 개발 모드로 진행합니다.', error);
                    setStage('survey');
                    return;
                }
                setErrorMessage(error.response?.data?.message || '유효하지 않거나 만료된 QR 코드입니다.');
                setStage('error');
            }
        };

        verify();
    }, [token, searchParams]);

    const handleSurveySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 태블릿 응답이 없는 경우: 태블릿 질문도 필수
        if (!hasTabletResponse) {
            if (!answers.q1_experience) {
                alert('Q1. POC 기간 동안, 이 시스템에 대해 가장 가까운 것은 무엇인가요? (필수)');
                return;
            }
            if (!answers.q2_experience_intent) {
                alert('Q2. 이 시스템에 대해 가장 가까운 생각은 무엇인가요? (필수)');
                return;
            }
            if (!answers.q3_cleanliness_satisfaction) {
                alert('Q3. 최근 1주일 기준, 현재 화장실 청결에 대해 전반적으로 어떻게 느끼셨나요? (필수)');
                return;
            }
        }

        // Q4는 필수 (복수 선택 가능, 최소 1개)
        if (!answers.q4_reason || !Array.isArray(answers.q4_reason) || answers.q4_reason.length === 0) {
            alert('Q' + (hasTabletResponse ? '4' : '4') + '. 위와 같이 느끼신 가장 큰 이유는 무엇인가요? (필수)');
            return;
        }

        // Q6은 필수
        if (!answers.q6_comparison) {
            alert('Q' + (hasTabletResponse ? '6' : '6') + '. 기존 화장실 불편 처리 방식과 비교하면, 이 시스템은 어떤가요? (필수)');
            return;
        }

        setStage('personalInfo');
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // FEAT-3: Validation
        if (phone !== phoneConfirm) {
            alert('휴대폰 번호가 일치하지 않습니다. 다시 확인해주세요.');
            return;
        }
        if (!consent) {
            alert('개인정보 수집 및 이용 동의는 필수입니다.');
            return;
        }
        const isDevMode = searchParams.get('dev') === 'true' || import.meta.env.DEV;

        if (!token && !isDevMode) return;

        try {
            // 개발 모드에서는 더미 토큰 사용
            const submitToken = token || 'dev-token-' + Date.now();

            // Q4 만족/불만족 이유 처리: 복수 선택 + 기타 텍스트
            const processedAnswers = { ...answers };
            if (answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes('other') && q4ReasonOther) {
                processedAnswers.q4_reason_other = q4ReasonOther;
            } else {
                // 기타가 선택되지 않았으면 기타 텍스트 제거
                delete processedAnswers.q4_reason_other;
            }

            // 태블릿 응답이 없는 경우 태블릿 질문도 포함
            const qrResponses = hasTabletResponse
                ? processedAnswers // 태블릿 응답이 있으면 모바일 질문만
                : { ...processedAnswers }; // 태블릿 응답이 없으면 전체 포함

            await surveyService.submitQR(submitToken, qrResponses, {
                name,
                phone,
                consent
            });
            setStage('success');
        } catch (error) {
            console.error(error);
            // 개발 모드에서는 에러를 무시하고 성공 처리
            if (isDevMode) {
                console.warn('🔧 [DEV MODE] 제출 실패했지만 개발 모드로 성공 처리합니다.');
                setStage('success');
                return;
            }
            alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    // Render Helpers
    if (stage === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">설문을 불러오는 중...</p>
            </div>
        );
    }

    if (stage === 'error') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">접근 불가</h2>
                    <p className="text-slate-600 mb-8 max-w-xs mx-auto text-balance">{errorMessage}</p>
                    <Button onClick={() => window.close()} variant="outline" size="lg">창 닫기</Button>
                </div>
            </Layout>
        );
    }

    if (stage === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center py-12 px-6 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">제출 완료!</h2>
                    <p className="text-slate-600 text-lg mb-8 text-balance">
                        소중한 의견 감사합니다.<br />
                        추첨을 통해 기프티콘을 보내드릴게요.
                    </p>
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-2xl border border-indigo-100 mb-8 text-left relative overflow-hidden">
                        <Gift className="w-6 h-6 text-indigo-500 mb-3" />
                        <h3 className="font-bold text-indigo-900 mb-1">안내사항</h3>
                        <p className="text-sm text-indigo-700 leading-relaxed">
                            당첨 시 입력하신 번호로 개별 연락드립니다.<br />
                            개인정보는 14일 후 안전하게 파기됩니다.
                        </p>
                    </div>
                    <Button onClick={() => window.close()} fullWidth variant="primary" size="lg">종료하기</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/80">
                <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-sm">V</div>
                        설문조사
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-full text-slate-500">Mobile View</div>
                        {(searchParams.get('dev') === 'true' || import.meta.env.DEV) && (
                            <div className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">DEV MODE</div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6">
                {stage === 'survey' && (
                    <form onSubmit={handleSurveySubmit} className="space-y-6 animate-in slide-in-from-right duration-500 fade-in">
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                                <Sparkles size={100} />
                            </div>
                            <h1 className="text-2xl font-bold mb-2 relative z-10">솔직한 의견을<br />들려주세요</h1>
                            <p className="text-indigo-100 text-sm relative z-10">더 나은 화장실 환경을 만드는데 큰 도움이 됩니다.</p>
                        </div>

                        <Card title="설문 조사" className="shadow-lg border-none ring-1 ring-slate-100">
                            <div className="space-y-8 py-2">
                                {/* 태블릿 응답이 없는 경우: 태블릿 질문 표시 */}
                                {!hasTabletResponse && (
                                    <>
                                        {/* 태블릿 Q1 - POC 인지·사용 여부 */}
                                        <div className="space-y-3">
                                            <label className="block text-base font-bold text-slate-900 leading-snug">
                                                <span className="text-indigo-600 mr-1">Q1.</span>
                                                이 태블릿 안내를 보거나 접해본 적이 있으신가요?
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { value: 'used', label: '① 실제로 사용해봤어요' },
                                                    { value: 'knew_no_opportunity', label: '② 알고는 있었지만, 사용할 상황이 없었어요' },
                                                    { value: 'knew_not_used', label: '③ 알고 있었지만, 사용하지는 않았어요' },
                                                    { value: 'saw_unknown', label: '④ 본 적은 있지만, 어떤 용도인지 몰랐어요' }
                                                ].map((opt) => (
                                                    <label key={opt.value} className={`group flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${answers.q1_experience === opt.value ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${answers.q1_experience === opt.value ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                            {answers.q1_experience === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                        </div>
                                                        <span className={`font-medium text-sm ${answers.q1_experience === opt.value ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                        <input
                                                            type="radio"
                                                            name="q1_experience"
                                                            value={opt.value}
                                                            onChange={(e) => setAnswers({ ...answers, q1_experience: e.target.value })}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 태블릿 Q2 - 통합 질문 (경험 + 향후 사용 가능성) */}
                                        <div className="space-y-3">
                                            <label className="block text-base font-bold text-slate-900 leading-snug">
                                                <span className="text-indigo-600 mr-1">Q2.</span>
                                                이 시스템에 대해 가장 가까운 생각은 무엇인가요?
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'used_helpful_will_use', label: '① 사용해봤고, 도움이 되었으며 앞으로도 사용할 것 같아요' },
                                                    { value: 'used_not_enough', label: '② 사용해봤지만, 기대만큼은 아니었어요' },
                                                    { value: 'not_used_will_try', label: '③ 아직 사용해보진 않았지만, 필요하면 써볼 의향은 있어요' },
                                                    { value: 'not_used_no_need', label: '④ 사용해볼 필요를 아직 느끼지 못했어요' }
                                                ].map((opt) => (
                                                    <label key={opt.value} className={`group flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${answers.q2_experience_intent === opt.value ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${answers.q2_experience_intent === opt.value ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                            {answers.q2_experience_intent === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                        </div>
                                                        <span className={`font-medium text-sm ${answers.q2_experience_intent === opt.value ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                        <input
                                                            type="radio"
                                                            name="q2_experience_intent"
                                                            value={opt.value}
                                                            onChange={(e) => setAnswers({ ...answers, q2_experience_intent: e.target.value })}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 태블릿 Q3 - 운영 변수 변경 효과 (청소 주기 만족도) */}
                                        <div className="space-y-3">
                                            <label className="block text-base font-bold text-slate-900 leading-snug">
                                                <span className="text-indigo-600 mr-1">Q3.</span>
                                                최근 1주일 기준, 현재 화장실 청결에 대해 전반적으로 어떻게 느끼셨나요?
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {[
                                                    { value: 'much_better', label: '① 이전보다 훨씬 쾌적해졌어요' },
                                                    { value: 'somewhat_better', label: '② 이전보다 조금 나아진 편이에요' },
                                                    { value: 'no_difference', label: '③ 예전과 큰 차이는 없어요' },
                                                    { value: 'not_sure', label: '④ 잘 모르겠어요' }
                                                ].map((opt) => (
                                                    <label key={opt.value} className={`group flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${answers.q3_cleanliness_satisfaction === opt.value ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${answers.q3_cleanliness_satisfaction === opt.value ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                            {answers.q3_cleanliness_satisfaction === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                        </div>
                                                        <span className={`font-medium text-sm ${answers.q3_cleanliness_satisfaction === opt.value ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                        <input
                                                            type="radio"
                                                            name="q3_cleanliness_satisfaction"
                                                            value={opt.value}
                                                            onChange={(e) => setAnswers({ ...answers, q3_cleanliness_satisfaction: e.target.value })}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 my-4"></div>
                                    </>
                                )}

                                {/* 태블릿 응답이 있는 경우 안내 메시지 */}
                                {hasTabletResponse && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                        <p className="text-sm text-blue-800">
                                            ✅ 태블릿에서 이미 답변하신 내용은 건너뛰고, 추가 질문만 답변해주세요.
                                        </p>
                                    </div>
                                )}

                                {/* Q4 - 만족/불만족 이유 (복수 선택 가능) */}
                                <div className="space-y-3">
                                    <label className="block text-base font-bold text-slate-900 leading-snug">
                                        <span className="text-indigo-600 mr-1">Q4.</span>
                                        위와 같이 느끼신 가장 큰 이유는 무엇인가요?
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3">(복수 선택 가능)</p>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'can_report_directly', label: '화장실 상태를 바로 전달할 수 있어서' },
                                            { value: 'no_direct_contact', label: '직원에게 직접 말하지 않아도 돼서' },
                                            { value: 'can_check_result', label: '처리 결과를 나중에 확인할 수 있어서' },
                                            { value: 'actually_improved', label: '실제로 개선된 걸 체감해서' },
                                            { value: 'slow_response', label: '응답이 늦거나 변화를 못 느껴서' },
                                            { value: 'confusing_location', label: '시스템 위치나 사용 방법이 헷갈려서' },
                                            { value: 'other', label: '기타' }
                                        ].map((opt) => (
                                            <div key={opt.value}>
                                                <label className={`group flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes(opt.value) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes(opt.value) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                        {answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes(opt.value) && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium text-sm ${answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes(opt.value) ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        name="q4_reason"
                                                        value={opt.value}
                                                        checked={answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes(opt.value)}
                                                        onChange={(e) => {
                                                            const currentReasons = Array.isArray(answers.q4_reason) ? [...answers.q4_reason] : [];
                                                            if (e.target.checked) {
                                                                setAnswers({ ...answers, q4_reason: [...currentReasons, opt.value] });
                                                            } else {
                                                                setAnswers({ ...answers, q4_reason: currentReasons.filter((r: string) => r !== opt.value) });
                                                                if (opt.value === 'other') {
                                                                    setQ4ReasonOther('');
                                                                    delete answers.q4_reason_other;
                                                                }
                                                            }
                                                        }}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                {/* 기타 선택 시 추가 입력 필드 */}
                                                {opt.value === 'other' && answers.q4_reason && Array.isArray(answers.q4_reason) && answers.q4_reason.includes('other') && (
                                                    <div className="mt-2 ml-7">
                                                        <textarea
                                                            className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm placeholder:text-slate-400"
                                                            placeholder="기타 이유를 자유롭게 적어주세요..."
                                                            value={q4ReasonOther}
                                                            onChange={(e) => {
                                                                setQ4ReasonOther(e.target.value);
                                                                setAnswers({ ...answers, q4_reason_other: e.target.value });
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Q5 - 실제 경험 사례 기록 (주관식, 선택) */}
                                <div className="space-y-3">
                                    <label className="block text-base font-bold text-slate-900 leading-snug">
                                        <span className="text-indigo-600 mr-1">Q5.</span>
                                        이 시스템 또는 화장실 관리와 관련해 기억에 남는 경험이 있다면 알려주세요.
                                        <span className="text-slate-400 text-xs font-normal ml-2">(선택)</span>
                                    </label>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            예시: 고장 신고 후 다음에 와보니 수리가 되어 있었던 경우<br />
                                            불편을 접수했는데 변화가 없었던 경우<br />
                                            이전보다 화장실 상태가 좋아졌다고 느낀 순간 등
                                        </p>
                                    </div>
                                    <textarea
                                        className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-sm placeholder:text-slate-400"
                                        placeholder="기억에 남는 경험을 자유롭게 적어주세요..."
                                        value={answers.q5_experience_story || ''}
                                        onChange={(e) => setAnswers({ ...answers, q5_experience_story: e.target.value })}
                                    />
                                </div>

                                {/* Q6 - 기존 방식 대비 가치 평가 */}
                                <div className="space-y-3">
                                    <label className="block text-base font-bold text-slate-900 leading-snug">
                                        <span className="text-indigo-600 mr-1">Q6.</span>
                                        기존 화장실 불편 처리 방식과 비교하면, 이 시스템은 어떤가요?
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'much_better', label: '① 훨씬 나아요' },
                                            { value: 'similar', label: '② 비슷해요' },
                                            { value: 'worse', label: '③ 오히려 불편해요' }
                                        ].map((opt) => (
                                            <label key={opt.value} className={`group flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${answers.q6_comparison === opt.value ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${answers.q6_comparison === opt.value ? 'border-indigo-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                                    {answers.q6_comparison === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                </div>
                                                <span className={`font-medium text-sm ${answers.q6_comparison === opt.value ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                                                <input
                                                    type="radio"
                                                    name="q6_comparison"
                                                    value={opt.value}
                                                    onChange={(e) => setAnswers({ ...answers, q6_comparison: e.target.value })}
                                                    className="sr-only"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="mt-8 pb-6">
                            <Button type="submit" fullWidth size="lg" variant="primary" className="shadow-xl shadow-indigo-200" rightIcon={<ArrowRight size={18} />}>
                                다음 단계로 (추첨 참여)
                            </Button>
                        </div>
                        <div className="h-8" /> {/* Spacer */}
                    </form>
                )}

                {stage === 'personalInfo' && (
                    <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in slide-in-from-right duration-500 fade-in">
                        <Card title="🎁 선물 증정 정보" description="커피 기프티콘 발송을 위해 연락처를 입력해주세요.">
                            <div className="space-y-6 py-2">
                                <div className="bg-amber-50 p-4 rounded-xl flex items-start space-x-3 border border-amber-100">
                                    <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800 leading-relaxed text-balance">
                                        입력하신 정보는 <strong>경품 발송 목적</strong>으로만 사용되며,
                                        <strong> 14일 후 자동으로 영구 파기</strong>됩니다.
                                    </p>
                                </div>

                                <Input
                                    label="이름 (선택)"
                                    placeholder="홍길동"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white"
                                />

                                <div className="space-y-4">
                                    <PhoneInput
                                        label="휴대폰 번호 (필수)"
                                        value={phone}
                                        onChange={setPhone}
                                        required
                                    />

                                    <PhoneInput
                                        label="휴대폰 번호 재확인 (필수)"
                                        value={phoneConfirm}
                                        onChange={setPhoneConfirm}
                                        required
                                        error={phone && phoneConfirm && phone !== phoneConfirm ? '번호가 일치하지 않습니다.' : undefined}
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="flex items-start space-x-3 cursor-pointer group">
                                        <div className="flex items-center h-6">
                                            <input
                                                type="checkbox"
                                                checked={consent}
                                                onChange={(e) => setConsent(e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                [필수] 개인정보 수집 및 이용에 동의합니다.
                                            </span>
                                            <p className="text-slate-500 mt-1 leading-relaxed text-xs">
                                                개인정보를 잘못 입력한 경우 기프티콘을 받지 못할 수 있음을 확인했습니다.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </Card>

                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 safe-area-pb">
                            <div className="max-w-lg mx-auto flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    variant="primary"
                                    className="shadow-xl shadow-indigo-200"
                                    disabled={!consent || !phone || phone !== phoneConfirm}
                                >
                                    설문 제출하고 추첨 참여하기
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setStage('survey')}
                                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2"
                                >
                                    이전 단계로 돌아가기
                                </button>
                            </div>
                        </div>
                        <div className="h-32" /> {/* Spacer for fixed bottom */}
                    </form>
                )}
            </main>
        </div>
    );
};

export default MobileSurvey;
