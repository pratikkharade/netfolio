import React from 'react';
import Loading from '../Loading/Loading';
import { formatCurrency } from '../helpers';

import "./Card.css";

function Card({ title, value, custom_class }) {
    return (
        <div className={`card-wrapper ${custom_class}`}>
            <div className="card-label">{title}</div>
            <div className="card-value">{value ? formatCurrency(value) : <Loading />}</div>
        </div>
    );
}

export default Card;
