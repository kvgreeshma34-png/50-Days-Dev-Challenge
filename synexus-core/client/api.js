import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://waijqfzfibniivpervjv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wm8cFPX-lrTshKNc00MPUw_OX3kowt6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function fetchLogsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data.map(item => item.log_message);
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local state:', err.message);
    return null;
  }
}

export async function postLogToSupabase(message) {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{ log_message: message }]);

    if (error) throw error;
  } catch (err) {
    console.error('Failed to sync log to Supabase:', err.message);
    throw err;
  }
}

export async function fetchDashboardData() {
  try {
    const [repoRes, ipRes] = await Promise.all([
      fetch('https://api.github.com/repos/octokit/core.js'),
      fetch('https://api.ipify.org?format=json')
    ]);

    const repoData = await repoRes.json();
    const ipData = await ipRes.json();

    return {
      repoName: repoData.full_name,
      repoStars: repoData.stargazers_count,
      clientIp: ipData.ip,
      fetchedAt: new Date().toLocaleTimeString()
    };
  } catch (error) {
    throw error;
  }
}