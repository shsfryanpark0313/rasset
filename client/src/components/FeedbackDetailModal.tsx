import React from 'react';
import { X, Calendar, Smartphone, QrCode } from 'lucide-react';
import { SURVEY_CONSTANTS, getQ3Score, getQ4Label } from '../utils/constants';

interface FeedbackDetailModalProps {
    feedback: any;
    onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({ feedback, onClose }) => {
    if (!feedback) return null;

    const tRes = feedback.tablet_responses;
    const qRes = feedback.qr_responses;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${feedback.type === 'tablet' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                            {feedback.type === 'tablet' ? <Smartphone size={20} /> : <QrCode size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">피드백 상세</h2>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar size={14} />
                                {new Date(feedback.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Tablet Questions (Common) */}
                    <div>
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                            기초 설문 (태블릿)
                        </h3>
                        <dl className="grid gap-6">
                            {tRes ? (
                                <>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Q1. 전반적 만족도</dt>
                                        <dd className="font-semibold text-gray-900">
                                            {tRes.q1_experience ? SURVEY_CONSTANTS.Q1_OPTIONS[tRes.q1_experience as keyof typeof SURVEY_CONSTANTS.Q1_OPTIONS]?.label || tRes.q1_experience : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Q2. 향후 사용 의향</dt>
                                        <dd className="font-semibold text-gray-900">
                                            {tRes.q2_experience_intent ? SURVEY_CONSTANTS.Q2_OPTIONS[tRes.q2_experience_intent as keyof typeof SURVEY_CONSTANTS.Q2_OPTIONS]?.label || tRes.q2_experience_intent : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Q3. 청결 만족도</dt>
                                        <dd className="flex items-center gap-2">
                                            {tRes.q3_cleanliness_satisfaction ? (
                                                <>
                                                    <span className="font-bold text-2xl text-emerald-600">
                                                        {getQ3Score(tRes.q3_cleanliness_satisfaction)}
                                                    </span>
                                                    <span className="text-gray-400">/ 5점</span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({SURVEY_CONSTANTS.Q3_SCORES[tRes.q3_cleanliness_satisfaction as keyof typeof SURVEY_CONSTANTS.Q3_SCORES]?.label})
                                                    </span>
                                                </>
                                            ) : '-'}
                                        </dd>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400 italic">태블릿 설문 데이터가 없습니다.</p>
                            )}
                        </dl>
                    </div>

                    {/* QR Specific Questions */}
                    {feedback.type === 'qr' && (
                        <div>
                            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4 border-b border-purple-100 pb-2">
                                상세 설문 (모바일)
                            </h3>
                            {qRes ? (
                                <dl className="grid gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Q4. 그렇게 느낀 이유</dt>
                                        <dd className="flex flex-wrap gap-2">
                                            {qRes.q4_reason?.map((r: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                                    {getQ4Label(r)}
                                                </span>
                                            ))}
                                            {qRes.q4_reason_other && (
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-100">
                                                    기타: {qRes.q4_reason_other}
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Q5. 개선 의견 (주관식)</dt>
                                        <dd className="p-4 bg-gray-50 rounded-lg text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                            {qRes.q5_experience_story || qRes.q5_improvement || '-'}
                                        </dd>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 mb-1">Q6. 기존 방식 비교</dt>
                                            <dd className="font-semibold text-gray-900">
                                                {qRes.q6_comparison ? SURVEY_CONSTANTS.Q6_COMPARISON[qRes.q6_comparison as keyof typeof SURVEY_CONSTANTS.Q6_COMPARISON] || qRes.q6_comparison : '-'}
                                            </dd>
                                        </div>
                                        {/* Q7 removed from new survey schema, but keeping safe access just in case */}
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-gray-400 italic">QR 상세 설문 데이터가 손상되었습니다.</p>
                            )}

                            {/* PII Info */}
                            {feedback.consent && (
                                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">📋 참여자 정보 (개인정보보호)</h4>
                                    <div className="bg-blue-50 p-4 rounded-lg flex gap-8">
                                        <div>
                                            <span className="text-xs text-blue-500 block mb-1">이름</span>
                                            <span className="font-medium text-blue-900">{feedback.name || '(암호화됨)'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-blue-500 block mb-1">연락처</span>
                                            <span className="font-medium text-blue-900">{feedback.phone || '(암호화됨)'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
