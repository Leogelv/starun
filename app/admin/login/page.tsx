'use client';
import { useState } from 'react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            window.location.href = '/admin/dashboard';
        } else {
            alert('Ошибка входа');
        }
    }

    return (
        <div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
            <button onClick={handleLogin}>Войти</button>
        </div>
    );
}