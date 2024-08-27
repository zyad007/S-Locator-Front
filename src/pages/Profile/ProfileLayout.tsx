import React from 'react';
import { Outlet } from 'react-router';

const ProfileLayout = () => {
    return (
        <div className='h-full w-[80%]'>
            <Outlet />
        </div>
    );
}

export default ProfileLayout;
