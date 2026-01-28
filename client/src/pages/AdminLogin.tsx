import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { adminService } from '../services/api';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await adminService.login({ email, password });
            // Store access token for API requests
            if (result.access_token) {
                localStorage.setItem('admin_token', result.access_token);
                console.log('✅ Login successful, token stored');
            }
            navigate('/admin/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error ||
                                error.message || 
                                '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
            
            const errorDetails = error.response?.data?.error || error.message;
            const fullMessage = errorDetails 
                ? `${errorMessage}\n\n상세: ${errorDetails}`
                : errorMessage;
            
            alert(`로그인 실패\n\n${fullMessage}\n\n상세 정보는 브라우저 콘솔(F12)을 확인하세요.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center pt-12 xl:pt-20">
                <Card title="관리자 로그인" className="w-full max-w-md xl:max-w-lg">
                    <form onSubmit={handleLogin} className="space-y-6 xl:space-y-8">
                        <div>
                            <label className="block text-base xl:text-lg font-semibold text-slate-700 mb-2">이메일</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="text-base xl:text-lg px-4 xl:px-5 py-3 xl:py-4"
                            />
                        </div>
                        <div>
                            <label className="block text-base xl:text-lg font-semibold text-slate-700 mb-2">비밀번호</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="text-base xl:text-lg px-4 xl:px-5 py-3 xl:py-4"
                            />
                        </div>
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={loading}
                            className="text-base xl:text-lg px-6 xl:px-8 py-4 xl:py-5"
                        >
                            로그인
                        </Button>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};

export default AdminLogin;
