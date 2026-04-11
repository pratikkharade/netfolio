import React from 'react';

import "./Date.css";
import Loading from '../Loading/Loading';

function Date({ date }) {
    return (
        <div className='last-updated'>
            {date ? `Last Updated: ${date}` : <Loading />}
        </div>
    );
}

export default Date;
