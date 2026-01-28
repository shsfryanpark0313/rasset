import { supabase } from '../lib/supabase';

// --- Constants ---
// QR Token Expiry directly processed on client for display/logic (DB also handles it via policy/job if needed)

export const qrService = {
    /**
     * Generate a transparent/Linked QR token directly in Supabase.
     * No backend server involved.
     */
    generateToken: async (tabletFeedbackId?: string) => {
        // 1. Create a random UUID-like token
        // Supabase `gen_random_uuid()` is best, but we need the token string here too.

        // Calculate expiry local time for consistency or rely on DB default if setup
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

        // Generate a random token string (UUID v4 style) client-side or use crypto
        const token = crypto.randomUUID();

        // 2. Insert into qr_tokens
        const { data, error } = await supabase
            .from('qr_tokens')
            .insert({
                token: token,
                expires_at: expiresAt.toISOString(),
                tablet_feedback_id: tabletFeedbackId || null
            })
            .select()
            .single();

        if (error) {
            console.error('QR Generation Error:', error);
            throw error;
        }

        // 3. Return formatted data
        return {
            token: data.token,
            url: `${window.location.origin}/survey?token=${data.token}`,
            expiresAt: data.expires_at
        };
    },

    /**
     * Verify token by querying Supabase directly.
     */
    verifyToken: async (token: string) => {
        const { data, error } = await supabase
            .from('qr_tokens')
            .select(`
                *,
                feedback:tablet_feedback_id (*)
            `)
            .eq('token', token)
            .single();

        if (error || !data) {
            throw new Error('유효하지 않거나 만료된 QR 코드입니다.');
        }

        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
            throw new Error('만료된 QR 코드입니다.');
        }

        if (data.used) {
            throw new Error('이미 사용된 QR 코드입니다.');
        }

        return {
            isValid: true,
            // RLS might block feedback join, but we know if ID exists, it's linked.
            // Return dummy object if feedback is missing but ID exists to trigger skip logic.
            hasTabletResponse: !!data.feedback || !!data.tablet_feedback_id,
            tabletResponses: data.feedback ? data.feedback.tablet_responses : (data.tablet_feedback_id ? { exists: true } : null)
        };
    }
};

export const surveyService = {
    /**
     * Submit Tablet Response directly to Supabase
     */
    submitTablet: async (responses: any, generateQR: boolean = false) => {
        // 1. Insert Feedback (Type: tablet)
        const { data: feedbackData, error: feedbackError } = await supabase
            .from('feedback')
            .insert({
                type: 'tablet',
                tablet_responses: responses,
                status: 'pending'
            })
            .select()
            .single();

        if (feedbackError) throw feedbackError;

        let qrTokenData = null;

        // 2. Generate QR if requested (Linked QR)
        if (generateQR && feedbackData) {
            // Call qrService directly
            qrTokenData = await qrService.generateToken(feedbackData.id);
        }

        return {
            success: true,
            feedbackId: feedbackData.id,
            qrToken: qrTokenData
        };
    },

    /**
     * Submit Mobile (QR) Response directly to Supabase
     */
    submitQR: async (token: string, qrResponses: any, personalInfo?: any) => {
        // 1. Verify token first to get the record ID (and handle used status)
        const { data: tokenData, error: tokenError } = await supabase
            .from('qr_tokens')
            .select('*')
            .eq('token', token)
            .single();

        if (tokenError || !tokenData) throw new Error('Invalid Token while submitting');

        // 2. Insert Feedback (Type: qr) OR Update existing if we want to link tightly?

        const { error: insertError } = await supabase
            .from('feedback')
            .insert({
                type: 'qr',
                qr_responses: qrResponses,
                token_id: tokenData.id,
                name: personalInfo?.name,
                phone: personalInfo?.phone, // Note: In real world, encrypt this!
                consent: personalInfo?.consent,
                status: 'pending'
            });

        if (insertError) throw insertError;

        // 3. Mark token as used
        await supabase
            .from('qr_tokens')
            .update({ used: true, used_at: new Date().toISOString() })
            .eq('id', tokenData.id);

        return { success: true };
    }
};

export const adminService = {
    /**
     * Login using Supabase Auth
     * Updated to accept object argument to match AdminLogin.tsx
     */
    login: async ({ email, password }: any) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return {
            user: data.user,
            access_token: data.session.access_token // Fixed key match
        };
    },

    /**
     * Get Stats (Aggregated)
     * Fully implemented to return all required fields for StatsOverview
     */
    getStats: async (params?: any) => {
        // Fetch all feedback to calculate stats
        // Warning: Not scalable for millions of rows, but fine for PoC (2 weeks).
        let query = supabase.from('feedback').select('*');

        if (params?.startDate) query = query.gte('created_at', params.startDate);
        if (params?.endDate) query = query.lte('created_at', params.endDate);
        if (params?.type) query = query.eq('type', params.type);

        const { data, error } = await query;
        if (error) throw error;

        // Initialize Counters
        const stats = {
            totalFeedbacks: data.length,
            todayFeedbacks: 0,
            q1_experience: {} as Record<string, number>,
            q2_intent: {} as Record<string, number>,
            q3_cleanliness: {
                average: '0.0',
                distribution: { '5': 0, '4': 0, '3': 0, '0': 0 } as Record<string, number>
            },
            q4_reasons: {} as Record<string, number>,
            q6_comparison: {} as Record<string, number>,
            keywords: [] as any[]
        };

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        let q3Sum = 0;
        let q3Count = 0;
        const keywordsCount: Record<string, number> = {};

        data.forEach((item: any) => {
            // Today Count
            const itemDate = new Date(item.created_at).toISOString().split('T')[0];
            if (itemDate === todayStr) {
                stats.todayFeedbacks++;
            }

            // --- Helper to process answers (DRY) ---
            const processAnswers = (res: any) => {
                if (!res) return;

                // Q1
                if (res.q1_experience) {
                    stats.q1_experience[res.q1_experience] = (stats.q1_experience[res.q1_experience] || 0) + 1;
                }
                // Q2
                if (res.q2_experience_intent) {
                    stats.q2_intent[res.q2_experience_intent] = (stats.q2_intent[res.q2_experience_intent] || 0) + 1;
                }
                // Q3
                if (res.q3_cleanliness_satisfaction) {
                    const val = res.q3_cleanliness_satisfaction;
                    let score = 0;
                    if (val === 'much_better') score = 5;
                    else if (val === 'somewhat_better') score = 4;
                    else if (val === 'no_difference') score = 3;

                    if (score > 0) {
                        q3Sum += score;
                        q3Count++;
                        stats.q3_cleanliness.distribution[String(score)] = (stats.q3_cleanliness.distribution[String(score)] || 0) + 1;
                    } else {
                        // not_sure or others
                        stats.q3_cleanliness.distribution['0'] = (stats.q3_cleanliness.distribution['0'] || 0) + 1;
                    }
                }
                // Q4 (Reasons) - Array (QR only usually, but safe to check)
                if (Array.isArray(res.q4_reason)) {
                    res.q4_reason.forEach((r: string) => {
                        stats.q4_reasons[r] = (stats.q4_reasons[r] || 0) + 1;
                        keywordsCount[r] = (keywordsCount[r] || 0) + 1;
                    });
                }
                // Q6 (Comparison)
                if (res.q6_comparison) {
                    stats.q6_comparison[res.q6_comparison] = (stats.q6_comparison[res.q6_comparison] || 0) + 1;
                }
            };

            // Process Tablet Responses
            if (item.tablet_responses) {
                processAnswers(item.tablet_responses);
            }

            // Process QR Responses (FIX: Also count Q1-Q3 from here if user answered them on mobile)
            if (item.qr_responses) {
                processAnswers(item.qr_responses);
            }
        });

        // Finalize Q3 Average
        stats.q3_cleanliness.average = q3Count > 0 ? (q3Sum / q3Count).toFixed(1) : '0.0';

        // Finalize Keywords
        stats.keywords = Object.entries(keywordsCount)
            .map(([key, count]) => ({ keyword: key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return stats;
    },

    /**
     * Get Feedbacks List
     */
    getFeedbacks: async (params?: any) => {
        let query = supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (params?.startDate) query = query.gte('created_at', params.startDate);
        if (params?.endDate) query = query.lte('created_at', params.endDate);
        if (params?.type) query = query.eq('type', params.type);

        const { data, error } = await query;
        if (error) throw error;

        return data; // Return list directly
    }
};

// No default export needed really, but keeping mostly compatible structure
export default { qrService, surveyService, adminService };
