import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../components/Button';
import { qrService, surveyService } from '../services/api';
import { Check, Smartphone, ArrowRight, Gift, Command } from 'lucide-react';

const TabletSurvey: React.FC = () => {
    const [tokenData, setTokenData] = useState<{ token: string; url: string; expiresAt: string } | null>(null);
    // const [qrGenerated, setQrGenerated] = useState<boolean>(false); // Unused
    const [answers, setAnswers] = useState<{
        q1_experience: string | null;
        q2_experience_intent: string | null;
        q3_cleanliness_satisfaction: string | null;
    }>({
        q1_experience: null,
        q2_experience_intent: null,
        q3_cleanliness_satisfaction: null
    });
    const [currentStep, setCurrentStep] = useState<number>(1); // 1: Q1, 2: Q2, 3: Q3, 4: Ready
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    // Standalone Token Loading
    const loadStandaloneToken = async () => {
        try {
            const data = await qrService.generateToken();
            if (data) {
                setTokenData({
                    token: data.token,
                    url: data.url,
                    expiresAt: data.expiresAt
                });
            }
        } catch (error) {
            console.error("Failed to load initial QR token", error);
        }
    };

    // Initial Load
    useEffect(() => {
        loadStandaloneToken();
    }, []);

    const handleQ1 = (val: string) => {
        setAnswers(prev => ({ ...prev, q1_experience: val }));
        if (currentStep < 2) {
            setCurrentStep(2);
            // Q2로 이동 시 아래로 스크롤 - Q2가 화면 중앙에 오도록
            setTimeout(() => {
                const q2Element = document.querySelector('[data-question="q2"]');
                if (q2Element) {
                    q2Element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    };

    const handleQ2 = (val: string) => {
        setAnswers(prev => ({ ...prev, q2_experience_intent: val }));
        if (currentStep < 3) {
            setCurrentStep(3);
        }
    };

    const handleQ3 = (val: string) => {
        setAnswers(prev => ({ ...prev, q3_cleanliness_satisfaction: val }));
        if (currentStep < 4) {
            setCurrentStep(4);
            // Q3 선택 시 제출 버튼이 보이도록 약간만 스크롤 (Q3도 보이도록)
            setTimeout(() => {
                const submitButton = document.querySelector('[data-submit-button]');
                if (submitButton) {
                    // 제출 버튼이 화면에 보이도록만 스크롤 (Q3는 계속 보이도록)
                    submitButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 300);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 응답 제출 시 QR 토큰도 함께 생성 요청
            const result = await surveyService.submitTablet(answers, true);
            console.log('📦 [Submit Result]', result);

            setSubmitted(true);

            // QR 토큰이 생성된 경우 저장
            if (result && result.qrToken) {
                const qrToken = result.qrToken;
                if (qrToken.url || qrToken.token) {
                    setTokenData({
                        token: qrToken.token,
                        url: qrToken.url || `${window.location.origin}/survey?token=${qrToken.token}`,
                        expiresAt: qrToken.expiresAt
                    });
                    // setQrGenerated(true);
                    console.log('🔗 [QR Generated] Mobile Survey Link:', qrToken.url);
                } else {
                    console.warn('⚠️ [QR Token Missing URL]', qrToken);
                }
            } else {
                console.warn('⚠️ [QR Token Not Generated]', {
                    result,
                    hasQrToken: !!result?.qrToken,
                    message: '서버에서 QR 토큰을 생성하지 못했습니다. 서버 로그를 확인하세요.'
                });
            }

            // QR 코드 스캔을 위한 충분한 시간 제공
            // 사용자가 화면 확인 → 휴대폰 꺼내기 → 카메라 실행 → QR 스캔까지 최소 20-30초 필요
            setTimeout(() => {
                setSubmitted(false);
                setAnswers({ q1_experience: null, q2_experience_intent: null, q3_cleanliness_satisfaction: null });
                setCurrentStep(1);
                // setQrGenerated(false);
                loadStandaloneToken();
            }, 30000);
        } catch (error) {
            console.error('❌ [Submit Error]', error);
            alert('전송 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
            {/* LEFT PANEL (65%): Survey Area - 태블릿 1920x1200 최적화 */}
            <div className="w-[65%] h-full flex flex-col p-8 xl:p-12 relative overflow-y-auto overflow-x-hidden">
                {/* Background Blobs */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-[80px] pointer-events-none" />

                {/* Header - 태블릿용 큰 폰트 */}
                <header className="flex items-center gap-4 mb-8 relative z-10 shrink-0">
                    <div className="bg-indigo-600 text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 text-xl flex items-center gap-2.5">
                        <Command className="w-6 h-6" /> VOC
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">RASSET Smart Clean</h1>
                        <p className="text-slate-400 text-base font-medium mt-1">더 나은 화장실 환경을 위해 의견을 남겨주세요.</p>
                    </div>
                </header>

                <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto w-full relative z-10 pb-4 min-h-0">
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
                            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
                                <Check className="w-16 h-16 text-emerald-600" />
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">의견 감사합니다!</h2>
                            <p className="text-slate-500 text-2xl font-medium">오른쪽 QR코드를 스캔하여<br />더 자세한 이야기도 들려주세요.</p>
                            <div className="mt-10 text-lg text-slate-400">
                                <div className="mb-2">QR 코드가 <span className="font-bold text-slate-600">30초간</span> 표시됩니다</div>
                                <div className="text-sm text-slate-400">휴대폰 카메라로 스캔해주세요</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Q1 Card - POC 인지·사용 여부 - 태블릿용 큰 크기 */}
                            <div data-question="q1" className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${currentStep === 1 ? 'opacity-100 translate-y-0 scale-100 ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-100 bg-white z-30' : currentStep > 1 ? 'opacity-60 scale-95 bg-white/90' : 'opacity-40 scale-95 bg-white/80 blur-[1px]'} rounded-3xl p-6 border border-slate-100`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
                                        이 태블릿 안내를 보거나 접해본 적이 있으신가요?
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'used', label: '① 실제로 사용해봤어요' },
                                        { value: 'knew_no_opportunity', label: '② 알고는 있었지만, 사용할 상황이 없었어요' },
                                        { value: 'knew_not_used', label: '③ 알고 있었지만, 사용하지는 않았어요' },
                                        { value: 'saw_unknown', label: '④ 본 적은 있지만, 어떤 용도인지 몰랐어요' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleQ1(opt.value)}
                                            className={`group py-6 px-6 rounded-2xl border-2 font-bold text-xl transition-all duration-300 text-left ${answers.q1_experience === opt.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-500'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2 Card - 통합 질문 (경험 + 향후 사용 가능성) - 태블릿용 큰 크기 */}
                            <div data-question="q2" className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${currentStep === 2 ? 'opacity-100 translate-y-0 scale-100 ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-100 bg-white z-30' : (currentStep > 2 ? 'opacity-100 scale-100 bg-white' : 'opacity-40 scale-95 bg-white/80 blur-[1px]')} rounded-3xl p-6 border border-slate-100`}>
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
                                    이 시스템에 대해 가장 가까운 생각은 무엇인가요?
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'used_helpful_will_use', label: '① 사용해봤고, 도움이 되었으며 앞으로도 사용할 것 같아요' },
                                        { value: 'used_not_enough', label: '② 사용해봤지만, 기대만큼은 아니었어요' },
                                        { value: 'not_used_will_try', label: '③ 아직 사용해보진 않았지만, 필요하면 써볼 의향은 있어요' },
                                        { value: 'not_used_no_need', label: '④ 사용해볼 필요를 아직 느끼지 못했어요' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            disabled={currentStep < 2}
                                            onClick={() => handleQ2(opt.value)}
                                            className={`py-5 px-5 rounded-2xl border-2 font-bold text-lg transition-all duration-300 text-left ${answers.q2_experience_intent === opt.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-500'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q3 Card - 운영 변수 변경 효과 (청소 주기 만족도) - 태블릿용 큰 크기 */}
                            <div data-question="q3" className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${currentStep === 3 || currentStep === 4 ? 'opacity-100 translate-y-0 scale-100 ring-4 ring-indigo-500/20 shadow-2xl shadow-indigo-100 bg-white z-30' : currentStep < 3 ? 'opacity-40 scale-95 bg-white/80 blur-[1px]' : 'opacity-60 scale-95 bg-white/90'} rounded-3xl p-6 border border-slate-100`}>
                                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${currentStep === 3 || currentStep === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
                                    최근 1주일 기준, 현재 화장실 청결에 대해 전반적으로 어떻게 느끼셨나요?
                                </h2>
                                <div className="grid grid-cols-6 gap-3">
                                    {[
                                        { value: 'much_better', label: '① 이전보다 훨씬 쾌적해졌어요' },
                                        { value: 'somewhat_better', label: '② 이전보다 조금 나아진 편이에요' },
                                        { value: 'no_difference', label: '③ 예전과 큰 차이는 없어요' },
                                        { value: 'not_sure', label: '④ 잘 모르겠어요' },
                                        { value: 'worse', label: '⑤ 나빠졌어요' }
                                    ].map((opt, index) => (
                                        <button
                                            key={opt.value}
                                            disabled={currentStep < 3}
                                            onClick={() => handleQ3(opt.value)}
                                            className={`py-5 px-5 rounded-2xl border-2 font-bold text-lg transition-all duration-300 text-left ${index < 2 ? 'col-span-3' : 'col-span-2'} ${answers.q3_cleanliness_satisfaction === opt.value ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-500'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Submit Action - 태블릿용 큰 버튼 (Q3와 함께 보이도록) */}
                <div data-submit-button className={`shrink-0 mt-4 mb-6 transition-all duration-500 max-w-5xl mx-auto w-full relative z-40 ${currentStep === 4 && !submitted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <Button
                        size="xl"
                        onClick={handleSubmit}
                        isLoading={loading}
                        className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl text-xl shadow-xl shadow-slate-300 font-bold flex items-center justify-center gap-4 transition-transform active:scale-[0.98] relative z-40"
                    >
                        소중한 의견 보내기 <ArrowRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* RIGHT PANEL (35%): Persistent QR & Reward - 태블릿 1920x1200 최적화 */}
            <div className="w-[35%] h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-10 xl:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                {/* Decorative & Glass Effect */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-500 rounded-full blur-[120px] opacity-40 animate-pulse" />
                <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-40" />

                <div className="z-10 text-center mt-4">
                    <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-base xl:text-lg font-semibold mb-8 border border-white/20 shadow-lg">
                        <Smartphone className="w-5 h-5 xl:w-6 xl:h-6 text-indigo-200" /> 모바일 전용
                    </div>
                    <h2 className="text-5xl xl:text-6xl font-black leading-tight mb-6 tracking-tight">
                        더 자세한 의견을<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-indigo-300">들려주세요!</span>
                    </h2>
                    <p className="text-indigo-100 text-xl xl:text-2xl font-medium">
                        {submitted
                            ? "QR코드를 스캔하여 추가 의견을 남겨주세요."
                            : "지금 바로 참여하거나, 태블릿으로 시작하세요."}
                    </p>
                </div>

                <div className="z-10 flex-1 flex items-center justify-center my-6">
                    <div className="p-6 xl:p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/50 transform rotate-1 hover:rotate-0 transition-all duration-500 group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-blue-500 rounded-[2.6rem] blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="relative bg-white rounded-[2.2rem] p-4 xl:p-5">
                            {tokenData && tokenData.url ? (
                                <QRCodeSVG
                                    value={tokenData.url}
                                    size={undefined}
                                    style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
                                    level="H"
                                    className="group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-[300px] h-[300px] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xl xl:text-2xl animate-pulse">
                                    QR 생성 중...
                                </div>
                            )}
                        </div>
                        <div className="mt-4 xl:mt-5 text-center text-slate-900 font-bold text-base xl:text-lg tracking-[0.2em]">
                            {tokenData && tokenData.url ? 'SCAN ME' : '대기 중...'}
                        </div>
                        {/* URL Debug Display */}
                        <div className="text-xs text-slate-300 mt-2 text-center opacity-70">
                            {tokenData?.url?.split('?')[0] || ''}
                        </div>
                    </div>
                </div>

                <div className="z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-6 xl:p-7 border border-white/20 flex items-center gap-5 xl:gap-6 shadow-lg">
                    <div className="w-16 h-16 xl:w-20 xl:h-20 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center text-amber-900 shadow-lg shrink-0 transform rotate-3">
                        <Gift className="w-8 h-8 xl:w-10 xl:h-10" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-xl xl:text-2xl text-white mb-1">커피 쿠폰 추첨</p>
                        <p className="text-base xl:text-lg text-indigo-200 leading-relaxed">사용자 의견 주신 분들<br />추첨을 통해 커피 쿠폰을 드려요</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabletSurvey;
