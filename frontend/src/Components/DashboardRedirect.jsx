import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth.js';

const DashboardRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        // Redirect based on user role
        switch (user.role) {
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            case 'SALESPERSON':
                navigate('/sales/dashboard');
                break;
            case 'CUSTOMER':
                navigate('/customer/dashboard');
                break;
            case 'INVENTORY_MANAGER':
                navigate('/inventory/dashboard');
                break;
            default:
                navigate('/login');
        }
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            color: '#666'
        }}>
            Redirecting to dashboard...
        </div>
    );
};

export default DashboardRedirect;
