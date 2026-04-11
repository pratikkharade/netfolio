import React from 'react';

import "./Details.css";
import Carousel from '../comp/Carousel/Carousel';

function Details({ checking, saving, investment, retirement, rent, cc }) {
    return (
        <div className="details-container">
            <h2 className='details-title'>Accounts</h2>
            <div className='carsousel-wrapper'>
                <Carousel type="asset" title="Checking Accounts" data={checking} />
                <Carousel type="asset" title="Saving Accounts" data={saving} />
                <Carousel type="asset" title="Investment Accounts" data={investment} />
                <Carousel type="asset" title="Retirement Accounts" data={retirement} />
                {rent.length > 0 && <Carousel type="liability" title="Rent & Utilities" data={rent} />}
                {cc.length > 0 && <Carousel type="liability" title="Credit Cards" data={cc} />}
            </div >
        </div >
    );
}

export default Details;
