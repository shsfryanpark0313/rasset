import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
import { LayoutDashboard, LogOut, RefreshCw, Filter, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsOverview } from '../components/StatsOverview';
import { FeedbackDetailModal } from '../components/FeedbackDetailModal';
import { SURVEY_CONSTANTS, getQ1Label, getQ3Score, getQ4Label } from '../utils/constants';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [surveyType, setSurveyType] = useState<'all' | 'tablet' | 'qr'>('all');
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Calculate Date Range
            let startDate: string | undefined;
            let endDate: string | undefined;
            const now = new Date();

            if (dateRange === 'today') {
                const start = new Date(now);
                start.setHours(0, 0, 0, 0);
                startDate = start.toISOString();

                const end = new Date(now);
                end.setHours(23, 59, 59, 999);
                endDate = end.toISOString();
            } else if (dateRange === 'week') {
                const start = new Date(now);
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = now.toISOString();
            } else if (dateRange === 'month') {
                const start = new Date(now);
                start.setMonth(now.getMonth() - 1);
                start.setHours(0, 0, 0, 0);
                startDate = start.toISOString();
                endDate = now.toISOString();
            }

            const params = {
                type: surveyType === 'all' ? undefined : surveyType,
                startDate,
                endDate
            };

            const statsData = await adminService.getStats(params);
            const feedbackData = await adminService.getFeedbacks(params);
            setStats(statsData);
            setFeedbacks(feedbackData);
        } catch (error: any) {
            console.error('Failed to fetch data', error);
            if (error.response?.status === 401) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [navigate, dateRange, surveyType]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-pretendard">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-xl font-bold text-slate-900">VOC 관리자</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchAll}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                            title="새로고침"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Intro */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">대시보드</h2>
                    <p className="text-slate-500 mt-1">실시간 설문 통계와 고객 피드백을 상세하게 확인하세요.</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-20 z-20">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-slate-500 font-medium mr-2 whitespace-nowrap">기간:</span>
                        {(['all', 'today', 'week', 'month'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${dateRange === range
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {range === 'all' && '전체'}
                                {range === 'today' && '오늘'}
                                {range === 'week' && '이번 주'}
                                {range === 'month' && '이번 달'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <span className="text-slate-500 font-medium mr-2 whitespace-nowrap">타입:</span>
                        {(['all', 'tablet', 'qr'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSurveyType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${surveyType === type
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {type === 'all' && '전체 보기'}
                                {type === 'tablet' && '태블릿만'}
                                {type === 'qr' && 'QR만'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Overview Component */}
                {stats && <StatsOverview stats={stats} />}

                {/* Feedback List Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-800">최신 피드백</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                {feedbacks.length}건
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">접수 시간</th>
                                    <th className="px-6 py-4">유형</th>
                                    <th className="px-6 py-4">Q1. 만족도</th>
                                    <th className="px-6 py-4">Q2. 의향</th>
                                    <th className="px-6 py-4">Q3. 평점</th>
                                    <th className="px-6 py-4">Q6. 비교</th>
                                    <th className="px-6 py-4">주요 의견</th>
                                    <th className="px-6 py-4 text-center">관리</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                            데이터가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    feedbacks.map((item) => {
                                        const tRes = item.tablet_responses;
                                        const qRes = item.qr_responses;

                                        // Q1 Label
                                        const q1Label = tRes?.q1_experience ? getQ1Label(tRes.q1_experience) : '-';

                                        // Q3 Score & Label
                                        const q3Value = tRes?.q3_cleanliness_satisfaction;
                                        const q3Score = q3Value ? getQ3Score(q3Value) : 0;
                                        const q3Text = q3Value ? `${q3Score}점` : '-';

                                        // Major Opinions (Q5 or Q4)
                                        let majorOpinion = '-';
                                        if (qRes) {
                                            if (qRes.q5_improvement) {
                                                majorOpinion = `[주관식] ${qRes.q5_improvement}`;
                                            } else if (qRes.q4_reason && Array.isArray(qRes.q4_reason)) {
                                                const reasonLabels = qRes.q4_reason.map((r: string) => getQ4Label(r));
                                                majorOpinion = reasonLabels.join(', ');
                                            }
                                        }

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.type === 'qr'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                        {item.type === 'qr' ? 'QR 상세' : '태블릿'}
                                                    </span>
                                                    {(item.name || item.phone) && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 ml-1 rounded-full bg-blue-100 text-blue-600" title="연락처 정보 포함">
                                                            <User size={12} />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">
                                                    {q1Label}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">
                                                    {tRes?.q2_experience_intent && SURVEY_CONSTANTS.Q2_OPTIONS[tRes.q2_experience_intent as keyof typeof SURVEY_CONSTANTS.Q2_OPTIONS]
                                                        ? SURVEY_CONSTANTS.Q2_OPTIONS[tRes.q2_experience_intent as keyof typeof SURVEY_CONSTANTS.Q2_OPTIONS].label
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {q3Text !== '-' ? (
                                                        <span className={`font-bold ${q3Score >= 4 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                            {q3Text}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700">
                                                    {qRes?.q6_comparison && SURVEY_CONSTANTS.Q6_COMPARISON[qRes.q6_comparison as keyof typeof SURVEY_CONSTANTS.Q6_COMPARISON]
                                                        ? SURVEY_CONSTANTS.Q6_COMPARISON[qRes.q6_comparison as keyof typeof SURVEY_CONSTANTS.Q6_COMPARISON]
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs truncate text-slate-600" title={majorOpinion}>
                                                        {majorOpinion}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedFeedback(item)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                                    >
                                                        상세 보기
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {selectedFeedback && (
                <FeedbackDetailModal
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
