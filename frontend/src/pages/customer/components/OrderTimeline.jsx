import React from 'react';

const OrderTimeline = ({ history }) => {
    if (!history || history.length === 0) {
        return <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No history records available for this order.</p>;
    }

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return '#059669';
            case 'PROCESSING': return '#d97706';
            case 'CANCELLED': return '#dc2626';
            case 'PENDING': return '#2563eb';
            case 'SHIPPED': return '#7c3aed';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>Order Progress</h3>
            <div style={{ position: 'relative', paddingLeft: '30px', borderLeft: '2px solid #e2e8f0', marginLeft: '10px' }}>
                {history.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '25px', position: 'relative' }}>
                        {/* Dot */}
                        <div style={{ 
                            position: 'absolute', 
                            left: '-37px', 
                            top: '4px', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            backgroundColor: getStatusColor(entry.new_status), 
                            border: '3px solid white', 
                            boxShadow: '0 0 0 2px #e2e8f0'
                        }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                                    {entry.new_status.toLowerCase().replace('_', ' ')}
                                </h4>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                    {entry.old_status ? `Updated from ${entry.old_status.toLowerCase()}` : 'Order initiated'}
                                    {entry.changed_by_name && ` by ${entry.changed_by_name}`}
                                </p>
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                {new Date(entry.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderTimeline;
