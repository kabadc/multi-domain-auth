import { cookies } from 'next/headers';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('site1_session')?.value;

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Account Portal</h1>
      <p>Welcome to the secure account dashboard.</p>
      <div style={{ padding: '20px', background: '#e0f7fa', border: '1px solid #00acc1', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Your Session Token (from .site1.local cookie)</h3>
        <code style={{ wordBreak: 'break-all', display: 'block', padding: '10px', background: '#fff', border: '1px solid #ccc' }}>
          {token?.substring(0, 50)}...
        </code>
      </div>
      <br/>
      <a href="https://site1.local" style={{ textDecoration: 'none', color: 'blue' }}>&larr; Back to Site 1</a>
    </div>
  );
}
