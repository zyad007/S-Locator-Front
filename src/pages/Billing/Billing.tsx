import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Billing = () => {
    const { isAuthenticated } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) nav("/auth");
    }, []);

    return (
        <div className='h-full w-96 bg-[#115740] px-1 py-1'>
            <div className='w-full h-full bg-white rounded'>

                <div className='text-2xl pl-6 pt-4 font-semibold mb-4'>
                    Billing
                </div>

                <div className='flex flex-col justify-center items-center'>

                    <Link className='text-[#115740] w-full py-2 pl-8  mb-2 font-bold hover:bg-gray-100 transition-all'
                        to={'/billing'}>Internal Cost Estimator</Link>

                    <Link className='text-[#115740] w-full py-2 pl-8  mb-2 font-bold hover:bg-gray-100 transition-all'
                        to={'/billing'}>Price Estimator</Link>

                </div>
            </div>
        </div>
    );
}

export default Billing;
