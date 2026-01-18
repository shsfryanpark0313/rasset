import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase Init
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in .env');
}

export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseKey || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
