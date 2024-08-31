import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const Organization = () => {

    const { isAuthenticated } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) nav("/auth");
    }, []);

    return (
        <div className='h-full w-96 bg-[#115740] px-1 py-1'>
            <div className='w-full h-full bg-white rounded'>

                <div className='text-2xl pl-6 pt-4 font-semibold mb-4'>
                    Organization
                </div>

                <div className='flex flex-col justify-center items-center'>

                    <Link className='text-[#115740] w-full py-2 pl-8  mb-2 font-bold hover:bg-gray-100 transition-all'
                        to={'/organization'}>Organization</Link>

                </div>
            </div>
        </div>
    );
}

export default Organization;
