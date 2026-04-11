import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Account from '../Account/Account';
import formatCurrency from '../helpers.jsx';
import Loading from '../Loading/Loading';

import "./Carousel.css";

function Carousel({ type, title, data }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const total = data.reduce((sum, item) => sum + item.balance, 0);

    return (
        <div className='carousel-container'>
            <div className='carousel-header' onClick={() => setIsExpanded((prev) => !prev)}>
                <div className='carousel-title'>
                    <div>{title}</div>
                    <div style={{
                        color: type === "liability" ? "#ff4d6d" : "#22c55e",
                        fontSize: "small", fontWeight: "bold"
                    }}>{total ? formatCurrency(total) : <Loading />}</div>
                </div>
                <button
                    type='button'
                    className='carousel-toggle-btn'
                    aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            <div className={`carousel-collapse ${isExpanded ? 'expanded' : 'collapsed'}`} aria-hidden={!isExpanded}>
                <div className='carousel-content'>
                    {data.sort((a, b) => b.balance - a.balance).map((d, i) => (
                        <Account
                            key={i}
                            name={d.name}
                            balance={d.balance}
                            type={d.type}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Carousel;
