import React from 'react';
import { Outlet } from 'react-router';

const BillingLayout = () => {
    return (
        <div className='w-[80%] h-full'>
            <Outlet />
        </div>
    );
}

export default BillingLayout;
