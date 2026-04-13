import React from 'react';
import { ChevronRight } from 'lucide-react';

function Chevron({ isExpanded, title }) {
    return (
        <button
            type='button'
            className={`carousel-toggle-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
            aria-label={isExpanded ? `Collapse ${title} ` : `Expand ${title} `}
            aria-expanded={isExpanded}
        >
            <ChevronRight size={18} />
        </button>
    )
}

export default Chevron;
