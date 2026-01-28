import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Target, ThumbsUp, Sparkles, MessageSquare, ArrowRightLeft } from 'lucide-react';
import { SURVEY_CONSTANTS, getQ1Label } from '../utils/constants';

interface StatsOverviewProps {
    stats: any;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
    if (!stats) return null;

    // Data Preparation
    // Q1 Data - Dynamic Mapping
    const q1Data = Object.entries(stats.q1_experience || {}).map(([key, value]) => {
        const label = SURVEY_CONSTANTS.Q1_OPTIONS[key as keyof typeof SURVEY_CONSTANTS.Q1_OPTIONS]?.label.split(' ')[1] || key;
        return {
            name: `${label} (${value}건)`,
            fullName: getQ1Label(key),
            value: Number(value)
        };
    }).filter(d => d.value > 0);

    // Q2 Data - Dynamic Mapping
    const q2Data = Object.entries(stats.q2_intent || {}).map(([key, value]) => {
        const label = SURVEY_CONSTANTS.Q2_OPTIONS[key as keyof typeof SURVEY_CONSTANTS.Q2_OPTIONS]?.label.split(' ')[1] || key;
        return {
            name: `${label} (${value}건)`,
            fullName: SURVEY_CONSTANTS.Q2_OPTIONS[key as keyof typeof SURVEY_CONSTANTS.Q2_OPTIONS]?.label || key,
            value: Number(value)
        };
    }).filter(d => d.value > 0);

    // Q3 Data - Distribution
    const q3Data = Object.entries(stats.q3_cleanliness.distribution).map(([score, count]) => ({
        name: `${score}점`,
        count: Number(count)
    }));

    // Q4 Data
    const q4Data = Object.entries(stats.q4_reasons).map(([reason, count]) => ({
        name: reason, // Might need label mapping if keys are English
        count: Number(count)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Q6 Data
    const q6Data = Object.entries(stats.q6_comparison).map(([key, count]) => ({
        name: SURVEY_CONSTANTS.Q6_COMPARISON[key as keyof typeof SURVEY_CONSTANTS.Q6_COMPARISON] || key,
        value: Number(count)
    })).filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Q1. Experience Satisfaction */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <ThumbsUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">Q1. POC 인지/경험</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={q1Data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {q1Data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, _name, props) => [value, props.payload.fullName]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Q3. Cleanliness Score */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-slate-800">Q3. 청결 만족도 (5점 척도)</h3>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">{stats.q3_cleanliness.average}점</span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={q3Data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} label={{ position: 'top' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Q2. User Intent */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-800">Q2. 향후 사용 의향</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={q2Data}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            >
                                {q2Data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, _name, props) => [value, props.payload.fullName]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Q6. Comparison (QR Only) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Q6. 기존 방식 비교 (QR)</h3>
                </div>
                <div className="h-64">
                    {q6Data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={q6Data} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            QR 설문 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Q4. Detailed Feedback (QR Only) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-800">Q4. 주요 이용 이유 (QR)</h3>
                </div>
                <div className="h-64">
                    {q4Data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={q4Data} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            QR 설문 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
